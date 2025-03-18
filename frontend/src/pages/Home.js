import React from 'react';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon,
  Flex,
  SimpleGrid,
  Image,
  VStack
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaStethoscope, FaPills, FaShieldAlt, FaRobot, FaMapMarkerAlt } from 'react-icons/fa';

const Feature = ({ title, text, icon }) => {
  return (
    <Stack align={'center'} textAlign={'center'}>
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'brand.500'}
        mb={1}
      >
        {icon}
      </Flex>
      <Text fontWeight={600}>{title}</Text>
      <Text color={'gray.600'}>{text}</Text>
    </Stack>
  );
};

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <>
      <Container maxW={'3xl'}>
        <Stack
          as={Box}
          textAlign={'center'}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
            lineHeight={'110%'}
          >
            Healthcare Powered By <br />
            <Text as={'span'} color={'brand.500'}>
              AI and Blockchain
            </Text>
          </Heading>
          <Text color={'gray.500'}>
            TeleMedChain combines the power of artificial intelligence and blockchain technology 
            to provide a secure, transparent telemedicine platform. Get AI-assisted diagnosis,
            personalized medicine recommendations, and secure medical records on the blockchain.
          </Text>
          <Stack
            direction={'column'}
            spacing={3}
            align={'center'}
            alignSelf={'center'}
            position={'relative'}
          >
            <Button
              as={RouterLink}
              to={currentUser ? '/dashboard' : '/register'}
              colorScheme={'brand'}
              bg={'brand.500'}
              rounded={'full'}
              px={6}
              _hover={{
                bg: 'brand.600',
              }}
            >
              {currentUser ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            <Button
              as={RouterLink}
              to={currentUser ? '/diagnosis' : '/login'}
              variant={'link'}
              colorScheme={'brand'}
              size={'sm'}
            >
              {currentUser ? 'Try AI Diagnosis' : 'Learn More'}
            </Button>
            <Box>
              <Icon
                as={Arrow}
                color={useColorModeValue('gray.800', 'gray.300')}
                w={71}
                position={'absolute'}
                right={-71}
                top={'10px'}
              />
              <Text
                fontSize={'lg'}
                fontFamily={'Caveat'}
                position={'absolute'}
                right={'-125px'}
                top={'-15px'}
                transform={'rotate(10deg)'}
              >
                {currentUser ? 'Fast & Secure' : 'Start for free!'}
              </Text>
            </Box>
          </Stack>
        </Stack>
      </Container>

      <Box bg={useColorModeValue('gray.50', 'gray.900')} p={10}>
        <Container maxW={'6xl'} mt={10}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
            <VStack align={'start'} spacing={6}>
              <Heading as="h2" size="xl">
                Revolutionizing Healthcare with Technology
              </Heading>
              <Text color={'gray.600'} fontSize={'lg'}>
                TeleMedChain is at the forefront of healthcare innovation, combining AI-powered diagnostics
                with blockchain technology to create a secure, transparent, and efficient telemedicine platform.
              </Text>
              <Text color={'gray.600'} fontSize={'lg'}>
                Our platform connects patients with AI diagnostic tools while ensuring traditional diagnosis
                remains the primary method. We provide personalized medicine recommendations based on your
                diagnosis, location, and preferences.
              </Text>
              <Button 
                as={RouterLink}
                to="/register"
                rounded={'full'} 
                size={'lg'} 
                fontWeight={'normal'} 
                colorScheme={'brand'}
                bg={'brand.500'}
                _hover={{ bg: 'brand.600' }}
              >
                Join Our Platform
              </Button>
            </VStack>
            <Image
              alt={'Feature Image'}
              src={'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'}
              objectFit={'cover'}
              borderRadius={'md'}
            />
          </SimpleGrid>
        </Container>
      </Box>

      <Box p={10}>
        <Container maxW={'6xl'} mt={10}>
          <Heading as="h2" size="xl" textAlign="center" mb={20}>
            Key Features
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <Feature
              icon={<Icon as={FaRobot} w={10} h={10} />}
              title={'AI-Powered Diagnosis'}
              text={
                'Get preliminary diagnosis using our advanced AI system trained on medical data. Our AI assistant analyzes symptoms and provides potential diagnoses and recommended treatments.'
              }
            />
            <Feature
              icon={<Icon as={FaPills} w={10} h={10} />}
              title={'Personalized Medicine'}
              text={
                'Receive medicine recommendations based on your diagnosis, with information about pricing, popularity, and ingredients to help you make informed decisions.'
              }
            />
            <Feature
              icon={<Icon as={FaShieldAlt} w={10} h={10} />}
              title={'Blockchain Security'}
              text={
                'Your medical records are securely stored on the blockchain, giving you complete control over your data while ensuring privacy and immutability.'
              }
            />
            <Feature
              icon={<Icon as={FaStethoscope} w={10} h={10} />}
              title={'Traditional Medicine Integration'}
              text={
                'Our AI diagnosis serves as a supplementary tool, not a replacement for professional medical advice. We facilitate connections with healthcare providers.'
              }
            />
            <Feature
              icon={<Icon as={FaMapMarkerAlt} w={10} h={10} />}
              title={'Location-Based Recommendations'}
              text={
                'Find medicines available in your area with real-time information about local pharmacies, availability, and pricing to save time and money.'
              }
            />
          </SimpleGrid>
        </Container>
      </Box>

      <Box bg={useColorModeValue('brand.50', 'gray.900')} p={10}>
        <Container maxW={'3xl'} textAlign="center">
          <Heading as="h2" size="xl" mb={6}>
            Ready to experience the future of healthcare?
          </Heading>
          <Text color={'gray.600'} fontSize={'lg'} mb={8}>
            Join thousands of users who are already benefiting from our AI-powered healthcare platform. 
            Registration is free and takes less than a minute.
          </Text>
          <Button
            as={RouterLink}
            to={currentUser ? '/dashboard' : '/register'}
            rounded={'full'}
            px={6}
            colorScheme={'brand'}
            bg={'brand.500'}
            _hover={{ bg: 'brand.600' }}
            size="lg"
          >
            {currentUser ? 'Go to Dashboard' : 'Sign Up Now'}
          </Button>
        </Container>
      </Box>
    </>
  );
}

const Arrow = createIcon({
  displayName: 'Arrow',
  viewBox: '0 0 72 24',
  path: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.600904 7.08166C0.764293 6.8879 1.01492 6.79004 1.26654 6.82177C2.83216 7.01918 5.20326 7.24581 7.54543 7.23964C9.92491 7.23338 12.1351 6.98464 13.4704 6.32142C13.84 6.13785 14.2885 6.28805 14.4722 6.65692C14.6559 7.02578 14.5052 7.47362 14.1356 7.6572C12.4625 8.48822 9.94063 8.72541 7.54852 8.7317C5.67514 8.73663 3.79547 8.5985 2.29921 8.44247C2.80955 9.59638 3.50943 10.6396 4.24665 11.7384C4.39435 11.9585 4.54354 12.1809 4.69301 12.4068C5.79543 14.0733 6.88128 15.8995 7.1179 18.2636C7.15893 18.6735 6.85928 19.0393 6.4486 19.0805C6.03792 19.1217 5.67174 18.8227 5.6307 18.4128C5.43271 16.4346 4.52957 14.868 3.4457 13.2296C3.3058 13.0181 3.16221 12.8046 3.01684 12.5885C2.05899 11.1646 1.02372 9.62564 0.457909 7.78069C0.383671 7.53862 0.437515 7.27541 0.600904 7.08166ZM5.52039 10.2248C5.77662 9.90161 6.24663 9.84687 6.57018 10.1025C16.4834 17.9344 29.9158 22.4064 42.0781 21.4773C54.1988 20.5514 65.0339 14.2748 69.9746 0.584299C70.1145 0.196597 70.5427 -0.0046455 70.931 0.134813C71.3193 0.274276 71.5206 0.70162 71.3807 1.08932C66.2105 15.4159 54.8056 22.0014 42.1913 22.965C29.6185 23.9254 15.8207 19.3142 5.64226 11.2727C5.31871 11.0171 5.26415 10.5479 5.52039 10.2248Z"
      fill="currentColor"
    />
  ),
});
