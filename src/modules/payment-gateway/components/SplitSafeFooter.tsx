'use client';

import { Link } from "react-router-dom";

export default function SplitSafeFooter() {
  return (
    <div className="text-center" style={{ marginTop: '60px' }}>
      <p className="text-xs text-gray-400">
        Powered by{' '}
        <span className="font-semibold text-[#FEB64D]">SplitSafe</span>
      </p>
      <p className="text-xs text-gray-500 mt-2">
        By proceeding, you agree to our{' '}
        <Link to="/terms-of-service" className="text-[#FEB64D] hover:underline">
          Terms of Service
        </Link>
        {' '}and{' '}
        <Link to="/privacy-policy" className="text-[#FEB64D] hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
