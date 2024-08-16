interface LoginProps {
  phoneNumber: string;
}

interface VerifyOtpCodeProps {
  phoneNumber: string;
  otpCode: string;
}

interface ResendOtpCodeProps {
  phoneNumber: string;
}
