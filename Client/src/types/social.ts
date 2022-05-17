export type FacebookPicture = {
  data: {
    width: number;
    height: number;
    is_silhouette: boolean;
    url: string;
  };
};

export type FacebookResponse = {
  accessToken: string;
  first_name: string;
  last_name: string;
  id: string;
  name: string;
  userID: string;
  signedRequest: string;
  graphDomain: string;
  data_access_expiration_time: number;
  expiresIn: number;
  picture: FacebookPicture;
  skin: string;
};
