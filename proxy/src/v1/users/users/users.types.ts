interface EditUserProfile {
  userId: string;
  fullname?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  file: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    path: string;
    size: number;
    filename: string;
  };
}
