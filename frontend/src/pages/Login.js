import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  HStack,
  VStack
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FaEthereum } from 'react-icons/fa';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const { login, error: authError } = useAuth();
  const { connected, connectWallet, signMessage, loginWithWeb3 } = useWeb3();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async (values, actions) => {
    setError('');
    setLoading(true);
    
    try {
      const result = await login(values.email, values.password);
      if (!result) {
        setError(authError || 'Failed to log in');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setLoading(false);
      actions.setSubmitting(false);
    }
  };

  const handleWeb3Login = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (!connected) {
        await connectWallet();
      }
      
      const message = `Sign this message to log in to TeleMedChain at ${new Date().toISOString()}`;
      const signatureData = await signMessage(message);
      
      if (signatureData) {
        const { address, signature } = signatureData;
        const result = await loginWithWeb3(address, signature);
        
        if (!result) {
          setError(authError || 'Failed to log in with wallet');
        }
      } else {
        setError('Failed to sign message with wallet');
      }
    } catch (err) {
      setError('An error occurred during Web3 login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Sign in to your account</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            to enjoy all of our cool <Text as={'span'} color={'brand.500'}>features</Text> ✌️
          </Text>
        </Stack>
        
        <Box
          rounded={'lg'}
          bg={formBg}
          boxShadow={'lg'}
          p={8}
          borderWidth={1}
          borderColor={borderColor}
        >
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Stack spacing={4}>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {(props) => (
                <Form>
                  <VStack spacing={4}>
                    <Field name="email">
                      {({ field, form }) => (
                        <FormControl isInvalid={form.errors.email && form.touched.email}>
                          <FormLabel>Email address</FormLabel>
                          <Input
                            {...field}
                            type="email"
                            placeholder="your-email@example.com"
                          />
                          <FormErrorMessage>{form.errors.email}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    
                    <Field name="password">
                      {({ field, form }) => (
                        <FormControl isInvalid={form.errors.password && form.touched.password}>
                          <FormLabel>Password</FormLabel>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Enter your password"
                          />
                          <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    
                    <Button
                      type="submit"
                      bg={'brand.500'}
                      color={'white'}
                      _hover={{
                        bg: 'brand.600',
                      }}
                      isLoading={props.isSubmitting || loading}
                      loadingText="Signing in"
                      w="full"
                    >
                      Sign in
                    </Button>
                  </VStack>
                </Form>
              )}
            </Formik>
            
            <Stack pt={2}>
              <Text align={'center'}>
                Don't have an account? <RouterLink to="/register"><Text as="span" color={'brand.500'}>Register</Text></RouterLink>
              </Text>
            </Stack>
            
            <Divider my={4} />
            
            <Button
              w={'full'}
              maxW={'md'}
              variant={'outline'}
              leftIcon={<FaEthereum />}
              onClick={handleWeb3Login}
              isLoading={loading}
              loadingText="Connecting"
            >
              Sign in with Web3 Wallet
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Login;
