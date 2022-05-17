import React from 'react';
import { chakra, Button } from '@chakra-ui/react';
import { FaFacebook } from 'react-icons/fa';

const LoginFbButton = (props) => {
  const { onClick, ...rest } = props;

  // console.error('@@@ login fb: ', props);
  return (
    <Button
      colorScheme="facebook"
      leftIcon={<FaFacebook />}
      onClick={onClick}
      size="lg"
      {...rest}
    >
      Login with Facebook
    </Button>
  );
};

const StyledLoginFbButton = chakra(LoginFbButton);

export default React.memo(StyledLoginFbButton);
