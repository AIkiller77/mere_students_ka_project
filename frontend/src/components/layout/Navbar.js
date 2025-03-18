import React from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Stack, 
  Collapse, 
  Icon, 
  Link, 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  useColorModeValue, 
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  HStack,
  Image
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  CloseIcon, 
  ChevronDownIcon, 
  ChevronRightIcon 
} from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWeb3 } from '../../contexts/Web3Context';

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const { currentUser, logout } = useAuth();
  const { connected, connectWallet, tokenBalance } = useWeb3();
  const navigate = useNavigate();

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        boxShadow="sm"
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <Button
            onClick={onToggle}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          >
            <Icon 
              as={isOpen ? CloseIcon : HamburgerIcon} 
              w={5} 
              h={5} 
            />
          </Button>
        </Flex>
        
        <Flex 
          flex={{ base: 1 }} 
          justify={{ base: 'center', md: 'start' }} 
          align={'center'}
        >
          <Text
            as={RouterLink}
            to="/"
            textAlign={{ base: 'center', md: 'left' }}
            fontFamily={'heading'}
            color={useColorModeValue('brand.600', 'white')}
            fontWeight="bold"
            fontSize="xl"
          >
            TeleMedChain
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
          align={'center'}
        >
          {currentUser ? (
            <>
              {connected ? (
                <HStack>
                  <Badge colorScheme="green" variant="solid" px={2} py={1} borderRadius="full">
                    {tokenBalance} MED
                  </Badge>
                </HStack>
              ) : (
                <Button
                  display={{ base: 'none', md: 'inline-flex' }}
                  size="sm"
                  fontSize="sm"
                  fontWeight={600}
                  color="white"
                  bg="brand.400"
                  onClick={connectWallet}
                  _hover={{
                    bg: 'brand.500',
                  }}
                >
                  Connect Wallet
                </Button>
              )}
              
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <Avatar
                    size={'sm'}
                    name={currentUser.full_name || currentUser.email}
                    bg="brand.500"
                    color="white"
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/dashboard">Dashboard</MenuItem>
                  <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                  <MenuItem as={RouterLink} to="/diagnosis">AI Diagnosis</MenuItem>
                  <MenuItem as={RouterLink} to="/medicines">Medicines</MenuItem>
                  <MenuItem as={RouterLink} to="/blockchain">Blockchain</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={logout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </>
          ) : (
            <>
              <Button
                as={RouterLink}
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
                to={'/login'}
              >
                Sign In
              </Button>
              <Button
                as={RouterLink}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'brand.500'}
                to={'/register'}
                _hover={{
                  bg: 'brand.400',
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('brand.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  const { currentUser } = useAuth();

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.filter(item => !item.requiresAuth || currentUser).map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={RouterLink}
                p={2}
                to={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
                {navItem.children && (
                  <Icon
                    as={ChevronDownIcon}
                    transition={'all .25s ease-in-out'}
                    ml={1}
                    w={4}
                    h={4}
                  />
                )}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Link
      as={RouterLink}
      to={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('brand.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'brand.500' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'brand.500'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  const { currentUser } = useAuth();
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.filter(item => !item.requiresAuth || currentUser).map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link as={RouterLink} key={child.label} py={2} to={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    requiresAuth: true,
  },
  {
    label: 'AI Diagnosis',
    href: '/diagnosis',
    requiresAuth: true,
  },
  {
    label: 'Medicines',
    href: '/medicines',
    requiresAuth: true,
  },
  {
    label: 'Blockchain',
    href: '/blockchain',
    requiresAuth: true,
  },
];

export default Navbar;
