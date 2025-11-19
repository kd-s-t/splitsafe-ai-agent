import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useAuth } from "@/contexts/auth-context";
import { ArrowLeft, FileX, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { principal } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <FileX className="w-12 h-12 text-gray-400" />
        </div>
        <Typography variant="h2" className="mb-4 text-gray-900 dark:text-white">
          Page Not Found
        </Typography>
        <Typography variant="base" className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist.
        </Typography>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
        {principal ? (
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => navigate("/login")}
            className="flex items-center gap-2"
          >
            Login
          </Button>
        )}
      </div>
    </div>
  );
}

