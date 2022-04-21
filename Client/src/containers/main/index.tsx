import React, { useState, useEffect } from 'react';
import { Box, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import { Header, Sidebar } from '@tlq/components';
import {Outlet} from "react-router-dom";

import './style.css';

const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
        <Sidebar isOpen={isOpen} onClose={onClose} />
        <Header onOpen={onOpen} />
        <Box
          ml={{ base: 0, md: 60 }}
          p="4"
          height="calc(100vh - 80px)"
          display="flex"
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default App;
