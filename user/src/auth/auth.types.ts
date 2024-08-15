interface LoginProps {
  phoneNumber: string;
}

interface SignupProps {
  fullName: string;
  phoneNumber: string;
  email: string;
}

interface VerifyOtpCodeProps {
  phoneNumber: string;
  otpCode: string;
}

interface ResendOtpCodeProps {
  phoneNumber: string;
}
