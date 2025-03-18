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
  VStack,
  Checkbox,
  HStack,
  InputGroup,
  InputRightElement,
  Select
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FaEthereum, FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  full_name: Yup.string().required('Full name is required'),
  date_of_birth: Yup.date().nullable().required('Date of birth is required'),
  gender: Yup.string().required('Gender is required'),
  acceptTerms: Yup.boolean().oneOf([true], 'You must accept the terms and conditions')
});

const Register = () => {
  const { register, error: authError } = useAuth();
  const { connected, connectWallet } = useWeb3();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const formBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async (values, actions) => {
    setError('');
    setLoading(true);
    
    try {
      // Remove confirmPassword and acceptTerms from the data sent to the server
      const { confirmPassword, acceptTerms, ...userData } = values;
      
      const result = await register(userData);
      if (!result) {
        setError(authError || 'Failed to register');
      }
    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
    } finally {
      setLoading(false);
      actions.setSubmitting(false);
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
          <Heading fontSize={'4xl'}>Create your account</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            Join TeleMedChain for AI-powered healthcare ✨
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
              initialValues={{
                email: '',
                password: '',
                confirmPassword: '',
                full_name: '',
                date_of_birth: '',
                gender: '',
                phone_number: '',
                wallet_address: '',
                acceptTerms: false
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleSubmit}
            >
              {(props) => (
                <Form>
                  <VStack spacing={4}>
                    <Field name="full_name">
                      {({ field, form }) => (
                        <FormControl isInvalid={form.errors.full_name && form.touched.full_name}>
                          <FormLabel>Full Name</FormLabel>
                          <Input
                            {...field}
                            placeholder="Your full name"
                          />
                          <FormErrorMessage>{form.errors.full_name}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    
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
                    
                    <HStack w="full">
                      <Field name="date_of_birth">
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.date_of_birth && form.touched.date_of_birth}>
                            <FormLabel>Date of Birth</FormLabel>
                            <Input
                              {...field}
                              type="date"
                            />
                            <FormErrorMessage>{form.errors.date_of_birth}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      
                      <Field name="gender">
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.gender && form.touched.gender}>
                            <FormLabel>Gender</FormLabel>
                            <Select
                              {...field}
                              placeholder="Select gender"
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                              <option value="prefer_not_to_say">Prefer not to say</option>
                            </Select>
                            <FormErrorMessage>{form.errors.gender}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </HStack>
                    
                    <Field name="phone_number">
                      {({ field, form }) => (
                        <FormControl>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <Input
                            {...field}
                            placeholder="Your phone number"
                          />
                        </FormControl>
                      )}
                    </Field>
                    
                    <Field name="password">
                      {({ field, form }) => (
                        <FormControl isInvalid={form.errors.password && form.touched.password}>
                          <FormLabel>Password</FormLabel>
                          <InputGroup>
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Create a password"
                            />
                            <InputRightElement width="4.5rem">
                              <Button
                                h="1.75rem"
                                size="sm"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                            </InputRightElement>
                          </InputGroup>
                          <FormErrorMessage>{form.errors.password}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    
                    <Field name="confirmPassword">
                      {({ field, form }) => (
                        <FormControl isInvalid={form.errors.confirmPassword && form.touched.confirmPassword}>
                          <FormLabel>Confirm Password</FormLabel>
                          <InputGroup>
                            <Input
                              {...field}
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="Confirm your password"
                            />
                            <InputRightElement width="4.5rem">
                              <Button
                                h="1.75rem"
                                size="sm"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                            </InputRightElement>
                          </InputGroup>
                          <FormErrorMessage>{form.errors.confirmPassword}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                    
                    <HStack w="full" justify="flex-start">
                      <Field name="wallet_address">
                        {({ field, form }) => (
                          <FormControl flex="3">
                            <FormLabel>Ethereum Wallet Address (Optional)</FormLabel>
                            <InputGroup>
                              <Input
                                {...field}
                                placeholder="0x..."
                                value={connected ? form.values.wallet_address : field.value}
                                isDisabled={connected}
                              />
                            </InputGroup>
                          </FormControl>
                        )}
                      </Field>
                      
                      <Box flex="1" alignSelf="flex-end" mb="1">
                        <Button
                          variant="outline"
                          colorScheme="brand"
                          leftIcon={<FaEthereum />}
                          onClick={async () => {
                            const result = await connectWallet();
                            if (result && window.ethereum && window.ethereum.selectedAddress) {
                              props.setFieldValue('wallet_address', window.ethereum.selectedAddress);
                            }
                          }}
                          isDisabled={connected}
                          size="md"
                        >
                          Connect
                        </Button>
                      </Box>
                    </HStack>
                    
                    <Field name="acceptTerms">
                      {({ field, form }) => (
                        <FormControl isInvalid={form.errors.acceptTerms && form.touched.acceptTerms}>
                          <Checkbox
                            {...field}
                            id="acceptTerms"
                            colorScheme="brand"
                          >
                            I accept the <Text as="span" color="brand.500">Terms of Service</Text> and <Text as="span" color="brand.500">Privacy Policy</Text>
                          </Checkbox>
                          <FormErrorMessage>{form.errors.acceptTerms}</FormErrorMessage>
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
                      loadingText="Creating account"
                      w="full"
                      mt={4}
                    >
                      Sign up
                    </Button>
                  </VStack>
                </Form>
              )}
            </Formik>
            
            <Stack pt={2}>
              <Text align={'center'}>
                Already have an account? <RouterLink to="/login"><Text as="span" color={'brand.500'}>Sign in</Text></RouterLink>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Register;
