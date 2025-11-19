import { ApiEndpoint, CodeExample } from './types';

export const API_BASE_URL = 'https://api.thesplitsafe.com/v1';
export const SANDBOX_API_BASE_URL = 'https://sandbox-api.thesplitsafe.com/v1';

export const CODE_EXAMPLES: CodeExample[] = [
  {
    language: 'javascript',
    label: 'JavaScript',
    logo: 'https://avatars.githubusercontent.com/u/9950313?s=48&v=4',
    code: `// Simple redirect-based integration
function redirectToSplitSafe(paymentData) {
  const splitsafeUrl = 'https://sandbox.thesplitsafe.com/payment-gateway';
  const params = new URLSearchParams({
    merchant: 'philippine_airlines',
    amount: paymentData.amount.toString(),
    currency: paymentData.currency,
    description: paymentData.description,
    return_url: 'https://your-app.com/payment/success',
    cancel_url: 'https://your-app.com/payment/cancel',
    api_key: process.env.VITE_SPLITSAFE_KEY // Your API key
  });

  // Redirect user to SplitSafe payment gateway
  window.location.href = \`\${splitsafeUrl}?\${params.toString()}\`;
}

// Usage example
const paymentData = {
  amount: 2500.00,
  currency: 'PHP',
  description: 'Flight booking - Manila to Cebu'
};

redirectToSplitSafe(paymentData);`
  },
  {
    language: 'python',
    label: 'Python',
    logo: 'https://docs.python.org/3/_static/py.svg',
    code: `from urllib.parse import urlencode
import webbrowser
import os

def redirect_to_splitsafe(payment_data):
    """Redirect user to SplitSafe payment gateway"""
    splitsafe_url = 'https://sandbox.thesplitsafe.com/payment-gateway'
    
    params = {
        'merchant': 'philippine_airlines',
        'amount': str(payment_data['amount']),
        'currency': payment_data['currency'],
        'description': payment_data['description'],
        'return_url': 'https://your-app.com/payment/success',
        'cancel_url': 'https://your-app.com/payment/cancel',
        'api_key': os.getenv('SPLITSAFE_API_KEY')  # Your API key
    }
    
    # Build URL with parameters
    redirect_url = f"{splitsafe_url}?{urlencode(params)}"
    
    # Open in browser (for web applications)
    webbrowser.open(redirect_url)
    
    return redirect_url

# Usage example
payment_data = {
    'amount': 2500.00,
    'currency': 'PHP',
    'description': 'Flight booking - Manila to Cebu'
}

redirect_url = redirect_to_splitsafe(payment_data)
print(f"Redirecting to: {redirect_url}")`
  },
  {
    language: 'php',
    label: 'PHP',
    logo: 'https://www.php.net/images/logos/php-logo-white.svg',
    code: `<?php
function redirectToSplitSafe($paymentData) {
    $splitsafeUrl = 'https://sandbox.thesplitsafe.com/payment-gateway';
    
    $params = [
        'merchant' => 'philippine_airlines',
        'amount' => $paymentData['amount'],
        'currency' => $paymentData['currency'],
        'description' => $paymentData['description'],
        'return_url' => 'https://your-app.com/payment/success',
        'cancel_url' => 'https://your-app.com/payment/cancel'
    ];
    
    // Build URL with parameters
    $redirectUrl = $splitsafeUrl . '?' . http_build_query($params);
    
    // Redirect user to SplitSafe payment gateway
    header("Location: " . $redirectUrl);
    exit();
}

// Usage example
$paymentData = [
    'amount' => 2500.00,
    'currency' => 'PHP',
    'description' => 'Flight booking - Manila to Cebu'
];

redirectToSplitSafe($paymentData);
?>`
  },
  {
    language: 'ruby',
    label: 'Ruby',
    logo: 'https://www.ruby-lang.org/images/header-ruby-logo.png',
    code: `require 'uri'
require 'net/http'

def redirect_to_splitsafe(payment_data)
  splitsafe_url = 'https://sandbox.thesplitsafe.com/payment-gateway'
  
  params = {
    'merchant' => 'philippine_airlines',
    'amount' => payment_data[:amount].to_s,
    'currency' => payment_data[:currency],
    'description' => payment_data[:description],
    'return_url' => 'https://your-app.com/payment/success',
    'cancel_url' => 'https://your-app.com/payment/cancel',
    'api_key' => ENV['SPLITSAFE_API_KEY'] # Your API key
  }
  
  # Build URL with parameters
  uri = URI(splitsafe_url)
  uri.query = URI.encode_www_form(params)
  
  # For web applications, redirect the user
  # In Rails: redirect_to uri.to_s
  # In Sinatra: redirect uri.to_s
  
  uri.to_s
end

# Usage example
payment_data = {
  amount: 2500.00,
  currency: 'PHP',
  description: 'Flight booking - Manila to Cebu'
}

redirect_url = redirect_to_splitsafe(payment_data)
puts "Redirecting to: #{redirect_url}"`
  },
  {
    language: 'go',
    label: 'Go',
    logo: '/go.png',
    code: `package main

import (
    "fmt"
    "net/http"
    "net/url"
    "os"
)

func redirectToSplitSafe(paymentData map[string]interface{}) string {
    splitsafeURL := "https://sandbox.thesplitsafe.com/payment-gateway"
    
    params := url.Values{}
    params.Add("merchant", "philippine_airlines")
    params.Add("amount", fmt.Sprintf("%.2f", paymentData["amount"].(float64)))
    params.Add("currency", paymentData["currency"].(string))
    params.Add("description", paymentData["description"].(string))
    params.Add("return_url", "https://your-app.com/payment/success")
    params.Add("cancel_url", "https://your-app.com/payment/cancel")
    params.Add("api_key", os.Getenv("SPLITSAFE_API_KEY")) // Your API key
    
    // Build URL with parameters
    redirectURL := fmt.Sprintf("%s?%s", splitsafeURL, params.Encode())
    
    // For web applications, redirect the user
    // http.Redirect(w, r, redirectURL, http.StatusSeeOther)
    
    return redirectURL
}

func main() {
    // Usage example
    paymentData := map[string]interface{}{
        "amount":      2500.00,
        "currency":    "PHP",
        "description": "Flight booking - Manila to Cebu",
    }
    
    redirectURL := redirectToSplitSafe(paymentData)
    fmt.Printf("Redirecting to: %s\\n", redirectURL)
}`
  }
];

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/auth/session',
    description: 'Get a session token using your API key for authenticated requests',
    parameters: [
      {
        name: 'Authorization',
        type: 'string',
        required: true,
        description: 'Bearer token with your API key (e.g., "Bearer sk_live_pal_abc123...")'
      }
    ],
    response: {
      status: 200,
      description: 'Session token created successfully',
      example: {
        success: true,
        data: {
          sessionToken: 'session_token_pal_abc_1703123456',
          expiresAt: '2024-12-16T10:00:00Z',
          clientId: 'client_pal_abc'
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/transactions/{transactionId}',
    description: 'Get transaction details by ID using session authentication',
    parameters: [
      {
        name: 'transactionId',
        type: 'string',
        required: true,
        description: 'The unique identifier of the transaction'
      },
      {
        name: 'Authorization',
        type: 'string',
        required: true,
        description: 'Bearer token with your session token (e.g., "Bearer session_token_pal_abc_1703123456")'
      }
    ],
    response: {
      status: 200,
      description: 'Transaction details retrieved successfully',
      example: {
        success: true,
        data: {
          id: 'txn_pal_abc_1703123456',
          amount: 2500.00,
          currency: 'PHP',
          status: 'completed',
          description: 'Flight booking - Manila to Cebu',
          createdAt: '2024-12-16T08:00:00Z',
          completedAt: '2024-12-16T08:15:00Z',
          escrow: {
            id: 'escrow_pal_abc_1703123456',
            status: 'active',
            bitcoinAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            bitcoinAmount: 0.00012345
          },
          merchant: {
            id: 'client_pal_abc',
            name: 'Philippine Airlines'
          }
        }
      }
    }
  }
];

export const QUICK_START_STEPS = [
  {
    step: 1,
    title: 'Redirect User',
    description: 'Redirect users to SplitSafe payment gateway with URL parameters'
  },
  {
    step: 2,
    title: 'User Pays',
    description: 'User authenticates with ICP and completes Bitcoin payment'
  }
];

export const AUTHENTICATION_HEADERS = [];

export const SAAS_INTEGRATION_FLOWS = [
  {
    title: 'Payment Gateway Integration',
    description: 'Simple redirect-based integration for SaaS applications',
    steps: [
      {
        step: 1,
        title: 'Redirect User',
        description: 'Redirect user to SplitSafe payment gateway with URL parameters',
        example: {
          url: 'https://thesplitsafe.com/payment-gateway?merchant=philippine_airlines&amount=2500.00&currency=PHP&description=Flight%20booking&return_url=https://your-app.com/success&cancel_url=https://your-app.com/cancel'
        }
      },
      {
        step: 2,
        title: 'User Authentication',
        description: 'User logs in with ICP Internet Identity on SplitSafe',
        example: 'User authenticates and proceeds to payment'
      },
      {
        step: 3,
        title: 'Payment Processing',
        description: 'User completes Bitcoin payment and escrow is created',
        example: 'Payment processed and escrow created automatically'
      },
      {
        step: 4,
        title: 'Return to App',
        description: 'User returns to your app via return_url or cancel_url',
        example: 'Handle success/cancel callbacks in your application'
      }
    ]
  }
];
