'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { constellationClient, validateTamperProof, ValidationResult } from '@/lib/integrations/constellation';
import { AlertCircle, CheckCircle, Clock, ExternalLink, Shield, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface TamperProofStatusProps {
  escrowId: string;
  title: string;
  creator: string;
  participants: Array<{
    principal: string;
    amount: string;
    percentage: number;
    nickname?: string;
  }>;
  createdAt: number;
  constellationHash?: string;
  onValidationComplete?: (result: ValidationResult) => void;
}

export function TamperProofStatus({
  escrowId,
  title,
  creator,
  participants,
  createdAt,
  constellationHash,
  onValidationComplete
}: TamperProofStatusProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidated, setLastValidated] = useState<number | null>(null);

  const validate = useCallback(async () => {
    if (!constellationHash) return;

    setIsValidating(true);
    try {
      const result = await validateTamperProof({
        escrowId,
        title,
        creator,
        participants,
        createdAt,
        constellationHash
      }, constellationClient.getApiClient());
      
      setValidationResult(result);
      setLastValidated(Date.now());
      onValidationComplete?.(result);
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResult({
        isValid: false,
        level: 'basic',
        errors: ['Validation failed: ' + (error as Error).message],
        warnings: [],
        constellationStatus: 'failed'
      });
    } finally {
      setIsValidating(false);
    }
  }, [constellationHash, escrowId, title, creator, participants, createdAt, onValidationComplete]);

  // Auto-validate on mount if hash exists
  useEffect(() => {
    if (constellationHash && !validationResult) {
      validate();
    }
  }, [constellationHash, validate, validationResult]);

  const getStatusIcon = () => {
    if (!validationResult) return <Clock className="h-4 w-4" />;
    
    switch (validationResult.constellationStatus) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    if (!validationResult) return 'bg-gray-500';
    
    switch (validationResult.constellationStatus) {
      case 'verified':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!validationResult) return 'Not Validated';
    
    switch (validationResult.constellationStatus) {
      case 'verified':
        return 'Tamper-Proof Verified';
      case 'failed':
        return 'Verification Failed';
      case 'pending':
        return 'Verification Pending';
      default:
        return 'Unknown Status';
    }
  };

  const getLevelText = () => {
    if (!validationResult) return '';
    
    switch (validationResult.level) {
      case 'basic':
        return 'Basic Validation';
      case 'constellation':
        return 'Constellation Verified';
      case 'full':
        return 'Full Integrity Verified';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Shield className="h-4 w-4" />
          Tamper-Proof Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge className={`${getStatusColor()} text-white`}>
            {getStatusText()}
          </Badge>
          {validationResult && (
            <span className="text-xs text-gray-500">
              {getLevelText()}
            </span>
          )}
        </div>

        {/* Constellation Hash */}
        {constellationHash && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Constellation Hash:</label>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono break-all">
                {constellationHash}
              </code>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(`https://digitalevidence.constellationnetwork.io/fingerprint/${encodeURIComponent(constellationHash)}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View on Constellation Network</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationResult && validationResult.errors.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-red-600">Errors:</label>
            <ul className="text-xs text-red-600 space-y-1">
              {validationResult.errors.map((error, index) => (
                <li key={index} className="flex items-start gap-1">
                  <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Validation Warnings */}
        {validationResult && validationResult.warnings.length > 0 && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-yellow-600">Warnings:</label>
            <ul className="text-xs text-yellow-600 space-y-1">
              {validationResult.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Validation Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={validate}
            disabled={!constellationHash || isValidating}
            className="text-xs"
          >
            {isValidating ? 'Validating...' : 'Re-validate'}
          </Button>
          
          {lastValidated && (
            <span className="text-xs text-gray-500">
              Last checked: {new Date(lastValidated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
