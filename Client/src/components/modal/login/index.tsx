import React, { useState, useCallback } from 'react';
import {
  Box,
  Stack,
  HStack,
  VStack,
  Text,
  Input,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useBreakpointValue,
  Container,
} from '@chakra-ui/react';
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi';
import Slider, { Settings } from 'react-slick';

import './style.css';

import Adam from '@tlq/assets/character/avatar/adam.png';
import Ash from '@tlq/assets/character/avatar/ash.png';
import Lucy from '@tlq/assets/character/avatar/lucy.png';
import Nancy from '@tlq/assets/character/avatar/nancy.png';

const avatars = [
  { name: 'adam', img: Adam },
  { name: 'ash', img: Ash },
  { name: 'lucy', img: Lucy },
  { name: 'nancy', img: Nancy },
];

const AvatarCarousel = ({ handleChangeSlide }) => {
  const [slider, setSlider] = React.useState<Slider | null>(null);

  const top = useBreakpointValue({ base: '90%', md: '50%' });
  const side = useBreakpointValue({ base: '30%', md: '10px' });

  // Settings for the slider
  const settings: Settings = {
    dots: true,
    arrows: false,
    fade: true,
    infinite: true,
    autoplay: false,
    speed: 500,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    useCSS: true,
  };

  return (
    <Box
      position={'relative'}
      height={'220px'}
      width={'140px'}
      overflow={'hidden'}
      className="myclass"
    >
      {/* CSS files for react-slick */}
      <link
        rel="stylesheet"
        type="text/css"
        charSet="UTF-8"
        href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
      />
      <link
        rel="stylesheet"
        type="text/css"
        href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
      />
      {/* Left Icon */}
      <IconButton
        aria-label="left-arrow"
        variant="ghost"
        position="absolute"
        left={side}
        top={top}
        transform={'translate(0%, -50%)'}
        zIndex={2}
        onClick={() => slider?.slickPrev()}
      >
        <BiLeftArrowAlt size="20px" />
      </IconButton>
      {/* Right Icon */}
      <IconButton
        aria-label="right-arrow"
        variant="ghost"
        position="absolute"
        right={side}
        top={top}
        transform={'translate(0%, -50%)'}
        zIndex={2}
        onClick={() => slider?.slickNext()}
      >
        <BiRightArrowAlt size="20px" />
      </IconButton>
      {/* Slider */}
      <Slider
        {...settings}
        afterChange={(currentSlide) => {
          handleChangeSlide(currentSlide);
        }}
        ref={(slider) => setSlider(slider)}
        className="slider-custom"
      >
        {avatars.map((avatar) => (
          <Box
            key={avatar.name}
            position="relative"
            backgroundPosition="initial"
            backgroundRepeat="no-repeat"
            backgroundSize="contain"
            backgroundImage={`url(${avatar.img})`}
          >
            {/* This is the block you need to change, to customize the caption */}
            <Container size="container.lg" height="200px" position="relative">
              <Stack
                spacing={6}
                w={'full'}
                maxW={'lg'}
                position="absolute"
                top="50%"
                transform="translate(0, -50%)"
              ></Stack>
            </Container>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

const ModalLogin = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState<string>('');
  const [indexSlide, setIndexSlide] = useState<number>(0);

  const onChangeSlide = useCallback(
    (currentSlide: number) => {
      setIndexSlide(currentSlide);
    },
    [indexSlide],
  );

  const handleOnChangeName = (e) => {
    setName((e.target as HTMLInputElement).value);
  };

  const handleSubmit = () => {
    // TODO
    const nameAvatar = avatars[indexSlide].name;
    onSubmit(name, nameAvatar);
  };

  return (
    <>
      <Modal
        isCentered
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Joining</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <HStack alignItems="flex-start">
              <VStack>
                <Text fontFamily="monospace" fontWeight="bold">
                  Select an avatar
                </Text>
                <AvatarCarousel handleChangeSlide={onChangeSlide} />
              </VStack>
              <VStack justifyContent="flex-start" alignItems="flex-start">
                <Box ml="50px">
                  <Input
                    autoFocus
                    placeholder="Name"
                    focusBorderColor="green.600"
                    mb="20px"
                    onChange={handleOnChangeName}
                  />
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    size="md"
                    onClick={() => {
                      // TODO
                    }}
                  >
                    Connect to camera
                  </Button>
                </Box>
              </VStack>
            </HStack>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button
              colorScheme="teal"
              mr={3}
              onClick={handleSubmit}
              isDisabled={!name}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalLogin;
