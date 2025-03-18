import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  VStack,
  Grid,
  GridItem,
  Checkbox,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  useToast,
  Container,
  Card,
  CardHeader,
  CardBody,
  CardFooter
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { FaStethoscope, FaPills, FaExclamationTriangle } from 'react-icons/fa';

const DiagnosisSchema = Yup.object().shape({
  symptoms: Yup.string().required('Please describe your symptoms'),
  duration: Yup.string().required('Please specify how long you have been experiencing these symptoms'),
  severity: Yup.string().required('Please rate the severity of your symptoms'),
  medicalHistory: Yup.array(),
  allergies: Yup.array(),
  currentMedications: Yup.array(),
  additionalInfo: Yup.string(),
});

const DiagnosisForm = () => {
  const { currentUser } = useAuth();
  const { storeMedicalRecord, verifyMedicine, mintReward } = useWeb3();
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [recommendedMedicines, setRecommendedMedicines] = useState([]);
  const toast = useToast();
  
  const boxBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async (values, actions) => {
    setDiagnosis(null);
    setRecommendedMedicines([]);
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      // Submit symptoms for AI diagnosis
      const response = await axios.post(
        '/api/diagnosis/analyze',
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setDiagnosis(response.data);
      
      // Get medicine recommendations based on diagnosis
      if (response.data && response.data.possible_diagnoses && response.data.possible_diagnoses.length > 0) {
        const primaryDiagnosis = response.data.possible_diagnoses[0];
        
        const medicinesResponse = await axios.get(
          `/api/medicines/search?diagnosis=${primaryDiagnosis.name}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setRecommendedMedicines(medicinesResponse.data);
        
        // Store diagnosis record on blockchain
        await storeMedicalRecord({
          record_type: 'diagnosis',
          diagnosis_id: response.data.diagnosis_id,
          timestamp: new Date().toISOString()
        });
        
        // Mint reward tokens for completing diagnosis
        await mintReward('diagnosis');
        
        toast({
          title: 'Diagnosis Completed',
          description: 'Your symptoms have been analyzed and recommendations provided. You earned 5 MED tokens!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error during diagnosis:', err);
      setError('An error occurred while analyzing your symptoms. Please try again later.');
    } finally {
      setLoading(false);
      actions.setSubmitting(false);
    }
  };

  const addAllergy = (values, setValues) => {
    if (newAllergy.trim() !== '') {
      setValues({
        ...values,
        allergies: [...values.allergies, newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (index, values, setValues) => {
    const updatedAllergies = [...values.allergies];
    updatedAllergies.splice(index, 1);
    setValues({
      ...values,
      allergies: updatedAllergies,
    });
  };

  const addMedication = (values, setValues) => {
    if (newMedication.trim() !== '') {
      setValues({
        ...values,
        currentMedications: [...values.currentMedications, newMedication.trim()],
      });
      setNewMedication('');
    }
  };

  const removeMedication = (index, values, setValues) => {
    const updatedMedications = [...values.currentMedications];
    updatedMedications.splice(index, 1);
    setValues({
      ...values,
      currentMedications: updatedMedications,
    });
  };

  const handleVerifyMedicine = async (medicineId) => {
    try {
      const result = await verifyMedicine(medicineId);
      
      if (result && result.verification_result && result.verification_result.verified) {
        toast({
          title: 'Medicine Verified',
          description: 'This medicine has been verified on the blockchain.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Verification In Progress',
          description: 'Medicine verification has been initiated on the blockchain.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error verifying medicine:', err);
      toast({
        title: 'Verification Failed',
        description: 'Failed to verify medicine on the blockchain.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={5}>
      <Box>
        <Heading as="h1" size="xl" mb={6}>
          AI-Powered Symptom Analysis
        </Heading>
        
        <Text mb={8} fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
          Please provide information about your symptoms for AI-assisted diagnosis. Remember, this is a
          supplementary tool and not a replacement for professional medical advice.
        </Text>

        <Alert status="info" mb={8} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Disclaimer</AlertTitle>
            <AlertDescription>
              This AI diagnostic tool is for informational purposes only and should not replace professional
              medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider
              for medical concerns.
            </AlertDescription>
          </Box>
        </Alert>

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={10}>
          <GridItem>
            <Box
              bg={boxBg}
              borderRadius="lg"
              boxShadow="md"
              p={6}
              borderWidth={1}
              borderColor={borderColor}
            >
              <Formik
                initialValues={{
                  symptoms: '',
                  duration: '',
                  severity: '',
                  medicalHistory: [],
                  allergies: [],
                  currentMedications: [],
                  additionalInfo: '',
                }}
                validationSchema={DiagnosisSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, values, setValues }) => (
                  <Form>
                    <VStack spacing={5} align="stretch">
                      <Field name="symptoms">
                        {({ field, form }) => (
                          <FormControl isInvalid={form.errors.symptoms && form.touched.symptoms} isRequired>
                            <FormLabel>Describe your symptoms in detail</FormLabel>
                            <Textarea
                              {...field}
                              placeholder="E.g., I have been experiencing a persistent headache, fatigue, and occasional dizziness..."
                              minH="120px"
                            />
                            {form.errors.symptoms && form.touched.symptoms && (
                              <Text color="red.500" mt={1} fontSize="sm">
                                {form.errors.symptoms}
                              </Text>
                            )}
                          </FormControl>
                        )}
                      </Field>

                      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                        <Field name="duration">
                          {({ field, form }) => (
                            <FormControl isInvalid={form.errors.duration && form.touched.duration} isRequired>
                              <FormLabel>How long have you experienced these symptoms?</FormLabel>
                              <Select
                                {...field}
                                placeholder="Select duration"
                              >
                                <option value="less-than-day">Less than a day</option>
                                <option value="1-3-days">1-3 days</option>
                                <option value="3-7-days">3-7 days</option>
                                <option value="1-2-weeks">1-2 weeks</option>
                                <option value="2-4-weeks">2-4 weeks</option>
                                <option value="1-3-months">1-3 months</option>
                                <option value="3-6-months">3-6 months</option>
                                <option value="more-than-6-months">More than 6 months</option>
                              </Select>
                              {form.errors.duration && form.touched.duration && (
                                <Text color="red.500" mt={1} fontSize="sm">
                                  {form.errors.duration}
                                </Text>
                              )}
                            </FormControl>
                          )}
                        </Field>

                        <Field name="severity">
                          {({ field, form }) => (
                            <FormControl isInvalid={form.errors.severity && form.touched.severity} isRequired>
                              <FormLabel>Rate the severity of your symptoms</FormLabel>
                              <Select
                                {...field}
                                placeholder="Select severity"
                              >
                                <option value="mild">Mild - Barely noticeable</option>
                                <option value="moderate">Moderate - Noticeable but manageable</option>
                                <option value="severe">Severe - Difficult to manage</option>
                                <option value="very-severe">Very Severe - Unbearable</option>
                              </Select>
                              {form.errors.severity && form.touched.severity && (
                                <Text color="red.500" mt={1} fontSize="sm">
                                  {form.errors.severity}
                                </Text>
                              )}
                            </FormControl>
                          )}
                        </Field>
                      </Grid>

                      <Box>
                        <FormLabel>Medical History (check all that apply)</FormLabel>
                        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={2}>
                          <Field name="medicalHistory">
                            {({ field, form }) => (
                              <Checkbox
                                isChecked={field.value.includes('diabetes')}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newValue = [...field.value];
                                  if (checked) {
                                    newValue.push('diabetes');
                                  } else {
                                    const index = newValue.indexOf('diabetes');
                                    if (index !== -1) {
                                      newValue.splice(index, 1);
                                    }
                                  }
                                  form.setFieldValue('medicalHistory', newValue);
                                }}
                              >
                                Diabetes
                              </Checkbox>
                            )}
                          </Field>
                          <Field name="medicalHistory">
                            {({ field, form }) => (
                              <Checkbox
                                isChecked={field.value.includes('hypertension')}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newValue = [...field.value];
                                  if (checked) {
                                    newValue.push('hypertension');
                                  } else {
                                    const index = newValue.indexOf('hypertension');
                                    if (index !== -1) {
                                      newValue.splice(index, 1);
                                    }
                                  }
                                  form.setFieldValue('medicalHistory', newValue);
                                }}
                              >
                                Hypertension
                              </Checkbox>
                            )}
                          </Field>
                          <Field name="medicalHistory">
                            {({ field, form }) => (
                              <Checkbox
                                isChecked={field.value.includes('heart_disease')}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newValue = [...field.value];
                                  if (checked) {
                                    newValue.push('heart_disease');
                                  } else {
                                    const index = newValue.indexOf('heart_disease');
                                    if (index !== -1) {
                                      newValue.splice(index, 1);
                                    }
                                  }
                                  form.setFieldValue('medicalHistory', newValue);
                                }}
                              >
                                Heart Disease
                              </Checkbox>
                            )}
                          </Field>
                          <Field name="medicalHistory">
                            {({ field, form }) => (
                              <Checkbox
                                isChecked={field.value.includes('asthma')}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newValue = [...field.value];
                                  if (checked) {
                                    newValue.push('asthma');
                                  } else {
                                    const index = newValue.indexOf('asthma');
                                    if (index !== -1) {
                                      newValue.splice(index, 1);
                                    }
                                  }
                                  form.setFieldValue('medicalHistory', newValue);
                                }}
                              >
                                Asthma
                              </Checkbox>
                            )}
                          </Field>
                          <Field name="medicalHistory">
                            {({ field, form }) => (
                              <Checkbox
                                isChecked={field.value.includes('cancer')}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newValue = [...field.value];
                                  if (checked) {
                                    newValue.push('cancer');
                                  } else {
                                    const index = newValue.indexOf('cancer');
                                    if (index !== -1) {
                                      newValue.splice(index, 1);
                                    }
                                  }
                                  form.setFieldValue('medicalHistory', newValue);
                                }}
                              >
                                Cancer
                              </Checkbox>
                            )}
                          </Field>
                          <Field name="medicalHistory">
                            {({ field, form }) => (
                              <Checkbox
                                isChecked={field.value.includes('thyroid_disorder')}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const newValue = [...field.value];
                                  if (checked) {
                                    newValue.push('thyroid_disorder');
                                  } else {
                                    const index = newValue.indexOf('thyroid_disorder');
                                    if (index !== -1) {
                                      newValue.splice(index, 1);
                                    }
                                  }
                                  form.setFieldValue('medicalHistory', newValue);
                                }}
                              >
                                Thyroid Disorder
                              </Checkbox>
                            )}
                          </Field>
                        </Grid>
                      </Box>

                      <Box>
                        <FormLabel>Allergies</FormLabel>
                        <HStack mb={2}>
                          <Input
                            value={newAllergy}
                            onChange={(e) => setNewAllergy(e.target.value)}
                            placeholder="Enter allergy"
                          />
                          <Button
                            onClick={() => addAllergy(values, setValues)}
                            colorScheme="brand"
                          >
                            Add
                          </Button>
                        </HStack>
                        <Box my={2}>
                          <HStack spacing={2} flexWrap="wrap">
                            {values.allergies.map((allergy, index) => (
                              <Tag
                                key={index}
                                size="md"
                                borderRadius="full"
                                variant="solid"
                                colorScheme="red"
                                my={1}
                              >
                                <TagLabel>{allergy}</TagLabel>
                                <TagCloseButton
                                  onClick={() => removeAllergy(index, values, setValues)}
                                />
                              </Tag>
                            ))}
                          </HStack>
                        </Box>
                      </Box>

                      <Box>
                        <FormLabel>Current Medications</FormLabel>
                        <HStack mb={2}>
                          <Input
                            value={newMedication}
                            onChange={(e) => setNewMedication(e.target.value)}
                            placeholder="Enter medication"
                          />
                          <Button
                            onClick={() => addMedication(values, setValues)}
                            colorScheme="brand"
                          >
                            Add
                          </Button>
                        </HStack>
                        <Box my={2}>
                          <HStack spacing={2} flexWrap="wrap">
                            {values.currentMedications.map((medication, index) => (
                              <Tag
                                key={index}
                                size="md"
                                borderRadius="full"
                                variant="solid"
                                colorScheme="purple"
                                my={1}
                              >
                                <TagLabel>{medication}</TagLabel>
                                <TagCloseButton
                                  onClick={() => removeMedication(index, values, setValues)}
                                />
                              </Tag>
                            ))}
                          </HStack>
                        </Box>
                      </Box>

                      <Field name="additionalInfo">
                        {({ field }) => (
                          <FormControl>
                            <FormLabel>Additional Information</FormLabel>
                            <Textarea
                              {...field}
                              placeholder="Any other information you'd like to provide..."
                            />
                          </FormControl>
                        )}
                      </Field>

                      <Button
                        mt={4}
                        colorScheme="brand"
                        isLoading={isSubmitting || loading}
                        type="submit"
                        size="lg"
                        leftIcon={<FaStethoscope />}
                      >
                        Analyze Symptoms
                      </Button>
                    </VStack>
                  </Form>
                )}
              </Formik>
            </Box>
          </GridItem>

          {/* Diagnosis Results */}
          <GridItem>
            <Box
              bg={boxBg}
              borderRadius="lg"
              boxShadow="md"
              p={6}
              borderWidth={1}
              borderColor={borderColor}
              minH="200px"
            >
              <Heading as="h2" size="lg" mb={4}>
                Diagnosis Results
              </Heading>

              {error && (
                <Alert status="error" my={4} borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <VStack spacing={4} align="stretch">
                  <Skeleton height="40px" />
                  <Skeleton height="100px" />
                  <Skeleton height="60px" />
                  <Skeleton height="100px" />
                </VStack>
              ) : diagnosis ? (
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading as="h3" size="md" mb={2}>
                      Possible Diagnoses
                    </Heading>
                    <VStack align="stretch" spacing={3}>
                      {diagnosis.possible_diagnoses.map((d, index) => (
                        <Box
                          key={index}
                          p={3}
                          bg={index === 0 ? 'brand.50' : 'gray.50'}
                          borderRadius="md"
                          borderWidth={1}
                          borderColor={index === 0 ? 'brand.200' : 'gray.200'}
                        >
                          <Flex justify="space-between" align="center">
                            <Heading as="h4" size="sm">
                              {d.name}
                            </Heading>
                            <Tag
                              colorScheme={
                                index === 0 ? 'brand' : 'gray'
                              }
                            >
                              {index === 0 ? 'Primary' : 'Alternative'} {index + 1}
                            </Tag>
                          </Flex>
                          <Text mt={2}>{d.description}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  <Divider />

                  <Box>
                    <Heading as="h3" size="md" mb={3}>
                      Recommendations
                    </Heading>
                    <Text>{diagnosis.recommendations}</Text>
                  </Box>

                  <Alert status="warning" borderRadius="md">
                    <AlertIcon as={FaExclamationTriangle} />
                    <Box>
                      <AlertTitle>Important Note</AlertTitle>
                      <AlertDescription>
                        This is an AI-generated diagnosis and should be confirmed by a healthcare professional.
                        Please consult with a doctor for proper medical advice.
                      </AlertDescription>
                    </Box>
                  </Alert>

                  {/* Blockchain verification stamp */}
                  <Box textAlign="center" mt={2}>
                    <Text fontSize="sm" color="gray.500">
                      Diagnosis ID: {diagnosis.diagnosis_id}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Secured on Blockchain
                    </Text>
                  </Box>
                </VStack>
              ) : (
                <Box textAlign="center" py={10}>
                  <Text color="gray.500">
                    Please fill out the form and submit it to receive an AI-assisted diagnosis.
                  </Text>
                </Box>
              )}
            </Box>

            {/* Recommended Medicines */}
            {recommendedMedicines.length > 0 && (
              <Box
                mt={6}
                bg={boxBg}
                borderRadius="lg"
                boxShadow="md"
                p={6}
                borderWidth={1}
                borderColor={borderColor}
              >
                <Heading as="h2" size="lg" mb={4} display="flex" alignItems="center">
                  <FaPills style={{ marginRight: '8px' }} />
                  Recommended Medicines
                </Heading>

                <VStack spacing={4} align="stretch">
                  {recommendedMedicines.map((medicine) => (
                    <Card key={medicine._id} variant="outline">
                      <CardHeader>
                        <Heading size="md">{medicine.name}</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text mb={2}>{medicine.description}</Text>
                        <HStack spacing={2} mt={2} flexWrap="wrap">
                          {medicine.active_ingredients.map((ingredient, idx) => (
                            <Tag key={idx} colorScheme="blue" size="sm" my={1}>
                              {ingredient}
                            </Tag>
                          ))}
                        </HStack>
                        <HStack mt={3} justifyContent="space-between">
                          <Text fontWeight="bold">
                            Price: ${medicine.price.toFixed(2)}
                          </Text>
                          <Text>
                            Popularity: {medicine.popularity_score}/10
                          </Text>
                        </HStack>
                      </CardBody>
                      <CardFooter>
                        <Button
                          colorScheme="brand"
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyMedicine(medicine._id)}
                          leftIcon={<FaShieldAlt />}
                        >
                          Verify on Blockchain
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </VStack>
              </Box>
            )}
          </GridItem>
        </Grid>
      </Box>
    </Container>
  );
};

export default DiagnosisForm;
