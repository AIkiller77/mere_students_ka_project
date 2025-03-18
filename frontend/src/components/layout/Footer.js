import React from 'react';
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  VisuallyHidden,
  chakra,
  useColorModeValue,
  Image,
  Heading
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube, FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const SocialButton = ({ children, label, href }) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

const Footer = () => {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}
      mt="auto"
      borderTop={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={'flex-start'}>
            <ListHeader>Product</ListHeader>
            <Link as={RouterLink} to={'/'}>Home</Link>
            <Link as={RouterLink} to={'/dashboard'}>Dashboard</Link>
            <Link as={RouterLink} to={'/diagnosis'}>AI Diagnosis</Link>
            <Link as={RouterLink} to={'/medicines'}>Medicines</Link>
            <Link as={RouterLink} to={'/blockchain'}>Blockchain</Link>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Link href={'#'}>About Us</Link>
            <Link href={'#'}>Press</Link>
            <Link href={'#'}>Careers</Link>
            <Link href={'#'}>Contact Us</Link>
            <Link href={'#'}>Partners</Link>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Legal</ListHeader>
            <Link href={'#'}>Privacy Policy</Link>
            <Link href={'#'}>Terms of Service</Link>
            <Link href={'#'}>Cookie Policy</Link>
            <Link href={'#'}>HIPAA Compliance</Link>
            <Link href={'#'}>Data Protection</Link>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Connect With Us</ListHeader>
            <Stack direction={'row'} spacing={6}>
              <SocialButton label={'Twitter'} href={'#'}>
                <FaTwitter />
              </SocialButton>
              <SocialButton label={'YouTube'} href={'#'}>
                <FaYoutube />
              </SocialButton>
              <SocialButton label={'Instagram'} href={'#'}>
                <FaInstagram />
              </SocialButton>
              <SocialButton label={'GitHub'} href={'#'}>
                <FaGithub />
              </SocialButton>
              <SocialButton label={'LinkedIn'} href={'#'}>
                <FaLinkedin />
              </SocialButton>
            </Stack>
          </Stack>
        </SimpleGrid>
      </Container>

      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.700')}>
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ md: 'space-between' }}
          align={{ md: 'center' }}>
          <Heading
            as="h2"
            size="md"
            color={useColorModeValue('brand.600', 'brand.400')}
            fontWeight="bold"
          >
            TeleMedChain
          </Heading>
          <Text>© {new Date().getFullYear()} TeleMedChain. All rights reserved</Text>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
