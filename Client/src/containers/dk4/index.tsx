import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import IFrame from '@tlq/components/iframe';

const DK4Container = () => {
  return (
    <Box
      w={{ base: 'full', xl: 'calc(100vw - 250px)' }}
      h="100%"
      overflow="hidden"
      position="relative"
      borderWidth="2px"
      borderRadius="5px"
      borderStyle="solid"
      borderColor="green.700"
    >
      <IFrame url="https://dut.udn.vn" />
    </Box>
  );
};

export default React.memo(DK4Container);
