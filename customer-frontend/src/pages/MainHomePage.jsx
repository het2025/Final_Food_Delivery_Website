import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/system';
import StarIcon from '@mui/icons-material/Star';
import { Card, CardMedia, CardContent, Typography, CardActions, IconButton, CircularProgress } from '@mui/material';
import Footer from '../components/Footer';

// IMPORTANT: adjust this import to point to your real API/service file
import { restaurantService } from '../services/api'; // <-- change path if necessary

// Sample avatar images (replace with real URLs or imports)
const avatars = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/65.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
];

const primaryRed = '#DC2626';
const darkGray = '#1F2937';
const grayText = '#6B7280';

// glassy Styled components
const Container = styled('div')({
  fontFamily: "'Poppins', sans-serif",
  background: 'url("https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977148/background_image_zdhvnl.png") no-repeat center center fixed', //main background image
  backgroundSize: 'cover',
  minHeight: '100vh',
  padding: '0px 20px 0 20px',
  boxSizing: 'border-box',
  color: darkGray,
  overflowX: 'hidden',
  margin: 0,
});

const GlassyWrapper = styled('div')({
  background: 'rgba(255, 255, 255, 0.15)',
  borderRadius: '20px',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '40px 100px 100px 100px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  maxWidth: '1400px',
  width: '100%',
  margin: '60px auto',
});

const Header = styled('header')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 40px',
  marginBottom: '30px',
  borderBottom: `1px solid #e5e7eb`,
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  width: '100%',
});

const Logo = styled('h1')({
  fontWeight: 800,
  fontSize: 28,
  userSelect: 'none',
  cursor: 'pointer',
  letterSpacing: 1.5,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '3px 13px',
  borderRadius: '80px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    background: 'rgba(255, 255, 255, 1)',
  },
  
  '& span.foo': {
    background: 'linear-gradient(135deg, #DC2626, #EF4444)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 900,
  },
  
  '& span.dy': {
    background: 'linear-gradient(135deg, #1F2937, #374151)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 900,
  },
});

const LogoIcon = styled('img')({
  width: '45px',
  height: '45px',
  objectFit: 'contain',
  filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))',
  transition: 'transform 0.3s ease',
  
  '&:hover': {
    transform: 'rotate(5deg) scale(1.05)',
  },
});

const Nav = styled('nav')({
  display: 'flex',
  gap: 40,
  fontWeight: 500,
  fontSize: 16,
  userSelect: 'none',
  marginLeft: 'auto',
  marginRight: '50px',
});

const NavItem = styled('a')(({ active }) => ({
  color: 'black',
  textDecoration: 'none',
  cursor: 'pointer',
  position: 'relative',
  fontSize: 16,
  fontWeight: 500,
  transition: 'color 0.3s ease',

  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: -4,
    height: 2,
    width: '100%',
    backgroundColor: 'white',
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease',
  },

  '&:hover': {
    color: 'white',
  },

  '&:hover::after': {
    transform: 'scaleX(1)',
  },
}));

const FloatingCTA = styled('button')({
  position: 'autolute',
  bottom: 30,
  right: 30,
  padding: '12px 24px',
  backgroundColor: primaryRed,
  color: '#fff',
  border: 'none',
  borderRadius: 9999,
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  zIndex: 2000,
  boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
});

const HeroSection = styled('section')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 20,
  marginBottom: 40,
  flexWrap: 'wrap',
  gap: 40,
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  paddingRight: 40,
});

const slideInFromLeft = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInFromRight = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const HeroLeft = styled('div')({
  flex: '1 1 400px',
  maxWidth: 600,
  opacity: 0,
  animation: `${slideInFromLeft} 1s ease-out forwards`,
});

const HeroRight = styled('div')({
  flex: '1 1 400px',
  maxWidth: 600,
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0,
  animation: `${slideInFromRight} 1s ease-out forwards`,
});

const Headline = styled('h2')({
  fontSize: 48,
  fontWeight: 900,
  lineHeight: 1.1,
  marginBottom: 30,
  userSelect: 'none',
});

const ButtonsRow = styled('div')({
  display: 'flex',
  gap: 20,
  marginBottom: 30,
});

const RedButton = styled('button')({
  backgroundColor: primaryRed,
  color: 'white',
  border: 'none',
  borderRadius: 9999,
  padding: '12px 28px',
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: '#b91c1c',
  },
});

const WhiteButton = styled('button')({
  backgroundColor: 'white',
  color: darkGray,
  border: `2px solid ${primaryRed}`,
  borderRadius: 9999,
  padding: '12px 28px',
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
  transition: 'background-color 0.3s ease, color 0.3s ease',
  '&:hover': {
    backgroundColor: primaryRed,
    color: 'white',
  },
});

const ReviewsSection = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  userSelect: 'none',
});

const ReviewsLabel = styled('span')({
  fontWeight: 600,
  fontSize: 14,
  marginRight: 10,
  color: darkGray,
});

const AvatarsWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: -8,
});

const Avatar = styled('img')({
  width: 32,
  height: 32,
  borderRadius: '50%',
  border: '2px solid white',
  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
  objectFit: 'cover',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.2)',
    zIndex: 10,
  },
});

const MoreReviews = styled('div')({
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: grayText,
  color: 'white',
  fontWeight: 600,
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
  cursor: 'default',
  userSelect: 'none',
});

const StarsWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 20,
  color: '#FBBF24',
});

const PastaBowl = styled('div')({});

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const PastaImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '50%',
  position: 'relative',
  zIndex: 2,
  animation: `${rotate} 20s linear infinite`,
  animationFillMode: 'forwards',
  transformOrigin: 'center center',
});

const MenuSection = styled('section')({
  marginTop: 60,
  overflow: 'hidden',
  maxWidth: '100%',
  boxSizing: 'border-box',
});

const slideAnimation = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

/* --- UPDATED: MenuGrid uses grid so exactly 5 cards line up in one row on wide screens --- */
const MenuGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)', // show 5 cards in a single row on wide screens
  gap: 24,
  alignItems: 'stretch',
  padding: '10px 0',
  width: '100%',
  boxSizing: 'border-box',
  // responsive breakpoints
  '@media (max-width: 1200px)': {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  '@media (max-width: 900px)': {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  '@media (max-width: 640px)': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@media (max-width: 420px)': {
    gridTemplateColumns: 'repeat(1, 1fr)',
  },
});

const MenuCard = styled('div')({
  backgroundColor: 'transparent',
  borderRadius: 24,
  boxShadow: 'none',
  padding: '12px 12px 20px',
  textAlign: 'center',
  position: 'relative',
  transition: 'transform 0.3s ease',
  cursor: 'pointer',
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  
  '&:hover': {
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

const MenuImageContainer = styled('div')({
  width: 200,
  height: 200,
  borderRadius: '50%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  position: 'relative',
  margin: '0 auto 16px auto',
});

const MenuImage = styled('img')({
  width: '100%',
  height: '100%',
  maxWidth: '200px', // Ensure it never exceeds container size
  maxHeight: '200px',
  objectFit: 'cover',
  objectPosition: 'center',
  borderRadius: '50%',
  display: 'block',
});

const MenuTitle = styled('h3')({
  fontWeight: 700,
  fontSize: 14,
  marginBottom: 4,
  color: darkGray,
  width: '100%',
  textAlign: 'left',
});

const MenuDescription = styled('p')({
  fontSize: 12,
  color: grayText,
  marginBottom: 12,
  width: '100%',
  textAlign: 'left',
});

const MenuPrice = styled('p')({
  fontWeight: 700,
  fontSize: 13,
  color: darkGray,
  width: '100%',
  textAlign: 'left',
});

const leafPositions = [
  { top: 10, left: 20, size: 30, rotate: 15 },
  { top: 100, right: 30, size: 40, rotate: -10 },
  { bottom: 50, left: 50, size: 25, rotate: 5 },
];

const tomatoPositions = [
  { top: 20, right: 100, size: 30 },
  { bottom: 30, right: 60, size: 20 },
];

const LeafDecoration = styled('div')(({ top, left, right, bottom, size, rotate }) => ({
  position: 'absolute',
  width: size,
  height: size,
  backgroundImage:
    'url(https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Basil-leaf.svg/120px-Basil-leaf.svg.png)',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  top: top !== undefined ? top : 'auto',
  left: left !== undefined ? left : 'auto',
  right: right !== undefined ? right : 'auto',
  bottom: bottom !== undefined ? bottom : 'auto',
  transform: `rotate(${rotate}deg)`,
  opacity: 0.3,
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 0,
}));

const TomatoDecoration = styled('div')(({ top, left, right, bottom, size }) => ({
  position: 'absolute',
  width: size,
  height: size,
  backgroundImage:
    'url(https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Tomato_je.jpg/120px-Tomato_je.jpg)',
  backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat',
  borderRadius: '50%',
  top: top !== undefined ? top : 'auto',
  left: left !== undefined ? left : 'auto',
  right: right !== undefined ? right : 'auto',
  bottom: bottom !== undefined ? bottom : 'auto',
  opacity: 0.3,
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 0,
}));

const restaurantData = [
  {
    name: 'The Brewery',
    cuisine: 'Chinese, North Indian',
    location: 'City Light, Surat',
    distance: '1.2 km',
    price: '₹600 for two',
    rating: 4.2,
    offer: 'Flat 15% off on pre-booking',
    bankOffer: 'Up to 10% off with bank offers',
    image: 'https://source.unsplash.com/400x300/?restaurant,indian'
  },
  {
    name: 'Blue Coriander',
    cuisine: 'Continental, North Indian',
    location: 'Neesle Market, Surat',
    distance: '1.3 km',
    price: '₹1000 for two',
    rating: 4.3,
    offer: 'Flat 25% off on walk-in',
    bankOffer: 'Up to 10% off with bank offers',
    image: 'https://source.unsplash.com/400x300/?restaurant,dining'
  },
  {
    name: 'Thakkar’s Hotel Jalaram',
    cuisine: 'North Indian, Kathiyawadi',
    location: 'Katargam, Surat',
    distance: '1.1 km',
    price: '₹800 for two',
    rating: 4.0,
    offer: 'Up to 10% off using SAVESURT',
    bankOffer: 'Up to 10% off with bank offers',
    image: 'https://source.unsplash.com/400x300/?restaurant,hotel'
  },
  {
    name: 'East Asia Multi Cuisine',
    cuisine: 'VIP Road, Surat',
    location: 'Surat',
    distance: '900 m',
    price: '₹900 for two',
    rating: 4.2,
    offer: 'Flat 20% off on all orders',
    bankOffer: 'Up to 10% off with bank offers',
    image: 'https://source.unsplash.com/400x300/?restaurant,table'
  }
];

const FooterContainer = styled('footer')({
  width: '100vw',
  minHeight: '200px', // Adjust height as needed
  position: 'relative',
  left: '50%',
  right: '50%',
  marginLeft: '-50vw',
  marginRight: '-50vw',
  background: 'rgba(0, 0, 0, 0.7)', 
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.3)',
  color: '#fff',
  textAlign: 'center',
  padding: '50px 20px 0 20px',
  marginTop: '60px 0 0 0',
  marginBottom: 0,
  zIndex: 1,
  borderRadius: 0, // Remove border radius for full width
  bottom: 0,
});

// Updated FooterContent to center content within full-width container
const FooterContent = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  maxWidth: '1200px', // Keep content centered
  margin: '0 auto',
  padding: '0 20px',
  '@media (max-width: 900px)': {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 32,
  },
});

// Rest of your footer styles remain the same...
const FooterBrand = styled('div')({
  flex: 1,
  minWidth: 220,
  textAlign: 'left',
  marginBottom: 16,
  '@media (max-width: 900px)': {
    textAlign: 'center',
  },
});

const FooterNav = styled('nav')({
  flex: 1,
  minWidth: 220,
  marginBottom: 16,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});

const FooterLink = styled('a')({
  color: '#fff',
  fontWeight: 500,
  textDecoration: 'none',
  margin: '4px 0',
  fontSize: 16,
  opacity: 0.91,
  transition: 'color 0.2s',
  '&:hover': {
    color: primaryRed,
  },
});

const FooterContact = styled('div')({
  flex: 1,
  minWidth: 220,
  textAlign: 'right',
  marginBottom: 16,
  '@media (max-width: 900px)': {
    textAlign: 'center',
  },
});

const FooterBottom = styled('div')({
  marginTop: 24,
  fontSize: 14,
  opacity: 0.7,
});

const FooterLogoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontWeight: 900,
  fontSize: 28,
  letterSpacing: 2,
  marginBottom: 12,
  padding: '8px 16px',
  borderRadius: '25px',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  
  '& span.quick': {
    background: 'linear-gradient(135deg, #DC2626, #EF4444)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  
  '& span.bite': {
    color: '#fff',
  },
});

export default function Homepage() {
  const navigate = useNavigate();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const handleLoginClick = () => {
    navigate('/login');
  };

  // New state for dynamic restaurants
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuItems = [
    {
      id: 1,
      title: 'Pappardelle With Vegetable',
      description: 'With Vegetable',
      price: '$35.00',
      image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977666/card_image1_enchiladas_d79uzq.png',
    },
    {
      id: 2,
      title: 'Ravioli Stuffed With Pesto Sauce',
      description: 'With Pesto Sauce',
      price: '$35.00',
      image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977703/card_image2_tamales_v4f2vu.png',
    },
    {
      id: 3,
      title: 'Pappardelle With Vegetable',
      description: 'With Vegetable',
      price: '$35.00',
      image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977678/card_image3_tostada_dyrsph.png',
    },
    {
      id: 4,
      title: 'Ravioli Stuffed With Pesto Sauce',
      description: 'With Pesto Sauce',
      price: '$35.00',
      image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977663/card_image4_burritos_o1snpm.png',
    },
    {
      id: 5,
      title: 'Ravioli Stuffed With Pesto Sauce',
      description: 'With Pesto Sauce',
      price: '$35.00',
      image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977699/card_image5_fajita_ys84ni.png',
    },
    {
      id: 6,
      title: 'Ravioli Stuffed With Pesto Sauce',
      description: 'With Pesto Sauce',
      price: '$35.00',
      image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977696/card_image6_ramen_xfdvhs.png',
    },
    {
      id: 7,
      title: 'Ravioli Stuffed With Pesto Sauce',
      description: 'With Pesto Sauce',
      price: '$35.00',
      image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977668/card_image7_gado_gado_lrmwej.png',
    },
    {
      id: 8,
      title: 'Ravioli Stuffed With Pesto Sauce',
      description: 'With Pesto Sauce',
      price: '$35.00',
      image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977669/card_image8_parsley_m5fc0h.png',
    },
    {
      id: 9,
      title: 'Ravioli Stuffed With Pesto Sauce',
      description: 'With Pesto Sauce',
      price: '$35.00',
      image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977686/card_image9_bibimbap_uaczwd.png',
    },
    {
      id: 10,
      title: 'Ravioli Stuffed With Pesto Sauce',
      description: 'With Pesto Sauce',
      price: '$35.00',
      image: 'https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977652/card_image10_ravioli_dgifis.png',
    },
  ];

  const duplicatedMenuItems = Array(5).fill(menuItems).flat();

  // Fetch restaurants from backend on mount
  useEffect(() => {
    let mounted = true;
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
        // Call your backend service. Adapt the call to your service shape:
        // e.g. restaurantService.getRestaurants({ limit: 4, page: 1 })
        const response = await restaurantService.getRestaurants
          ? await restaurantService.getRestaurants({ limit: 4, page: 1 })
          : null;

        // Example handling depending on your API shape:
        // If your service returns { success: true, data: [...] } or { data: [...] }
        if (mounted) {
          if (response) {
            // Try common shapes
            const data =
              response.success && response.data
                ? response.data
                : response.data
                ? response.data
                : Array.isArray(response)
                ? response
                : null;

            if (data && Array.isArray(data)) {
              setRestaurants(data);
            } else {
              // fallback to static data if response shape unexpected
              setRestaurants(restaurantData);
              setError('Unexpected response shape from API — showing fallback data.');
            }
          } else {
            // if restaurantService.getRestaurants is not implemented or returned null
            setRestaurants(restaurantData);
            setError('restaurantService.getRestaurants not available. Showing fallback data.');
          }
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        if (mounted) {
          setError('Failed to load restaurants. Showing fallback data.');
          setRestaurants(restaurantData);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRestaurants();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <Header>
        <Logo>
          <LogoIcon src="/quickbite_logo.svg" alt="Logo" />
          <span>
            <span className="foo">Quick</span>
            <span className="dy">Bite</span>
          </span>
        </Logo>
        <Nav>
          <NavItem active>Home</NavItem>
          <NavItem>Menu</NavItem>
          <NavItem>About Us</NavItem>
          <NavItem>Contact</NavItem>
        </Nav>
        <FloatingCTA onClick={handleLoginClick}>SignUp/Login</FloatingCTA>
      </Header>

      <GlassyWrapper>
        <HeroSection>
          <HeroLeft>
            <Headline>From Kitchen to You: Fresh, Fast, and Flavorful!</Headline>
            <ButtonsRow>
              <RedButton>Order Now</RedButton>
              <WhiteButton>Browse Menu</WhiteButton>
            </ButtonsRow>
            <ReviewsSection>
              <ReviewsLabel>Reviews</ReviewsLabel>
              <AvatarsWrapper>
                {avatars.slice(0, 4).map((src, i) => (
                  <Avatar key={i} src={src} alt={`User avatar ${i + 1}`} />
                ))}
                <MoreReviews>45+</MoreReviews>
              </AvatarsWrapper>
              <StarsWrapper>
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </StarsWrapper>
            </ReviewsSection>
          </HeroLeft>
          <HeroRight>
            {/* main pasta rotating image */}
            <PastaBowl>
              <PastaImage src="https://res.cloudinary.com/dovlhkyrr/image/upload/v1753977642/image1_veeji2.png" alt="Pasta bowl"
               /> 
            </PastaBowl>
            {leafPositions.map((pos, i) => (
              <LeafDecoration key={i} {...pos} />
            ))}
            {tomatoPositions.map((pos, i) => (
              <TomatoDecoration key={i} {...pos} />
            ))} 
          </HeroRight>
        </HeroSection>

        <MenuSection>
          {/* Render exactly 5 menu item cards in one line on wide screens */}
          <MenuGrid onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            {duplicatedMenuItems.slice(0, 5).map((item, index) => (
              <MenuCard key={index}>
                <MenuImageContainer>
                  <MenuImage src={item.image} alt={item.title} onError={(e) => { e.target.src = item.image; }} />
                </MenuImageContainer>
                <MenuTitle>{item.title}</MenuTitle>
                <MenuDescription>{item.description}</MenuDescription>
                <MenuPrice>{item.price}</MenuPrice>
              </MenuCard>
            ))}
          </MenuGrid>

            {/* ===== Replaced: Dynamic Restaurant Cards Section (fetch from backend) ===== */}
            <section style={{ marginTop: 60 }}>
              <div style={{
                padding: '60px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                marginBottom: '40px'
              }}>

                {/* Inline styles + media queries for precise 4-per-row layout */}
                <style>
{`
  .restaurants-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    align-items: stretch;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Ensure each card has consistent height and internal layout */
  .restaurants-grid .restaurant-card {
    display: flex;
    flex-direction: column;
    height: 380px; /* fixed height for visual consistency */
  }

  .restaurants-grid .restaurant-card .card-media {
    height: 180px;
    width: 100%;
    object-fit: cover;
    flex-shrink: 0;
  }

  .restaurants-grid .restaurant-card .card-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1 1 auto;
  }

  /* Responsive breakpoints */
  @media (max-width: 1100px) {
    .restaurants-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .restaurants-grid {
      grid-template-columns: repeat(1, 1fr);
      padding: 0 16px;
    }
    .restaurants-grid .restaurant-card {
      height: auto;
    }
  }
`}
                </style>

                {/* Section Title */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '24px'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: darkGray, marginBottom: '8px' }}>
                    Discover Best Restaurants
                  </Typography>
                  <Typography variant="body1" sx={{ color: grayText }}>
                    Explore delicious meals from top-rated restaurants
                  </Typography>
                </div>

                {/* Loading State */}
                {loading && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px',
                    gap: 16
                  }}>
                    <CircularProgress />
                    <Typography sx={{ color: grayText, fontSize: 18 }}>Loading restaurants...</Typography>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    backgroundColor: '#FEE2E2',
                    borderRadius: '12px',
                    marginBottom: 16
                  }}>
                    <Typography sx={{ color: '#DC2626', fontSize: 16, marginBottom: 1 }}>{error}</Typography>
                    <button
                      onClick={() => window.location.reload()}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: primaryRed,
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Restaurant Cards Grid: 4 cards per row on wide screens */}
                {!loading && !error && restaurants.length > 0 && (
                  <div className="restaurants-grid" aria-live="polite">
                    {restaurants.map((restaurant, idx) => {
                      // normalize fields for safety
                      const id = restaurant._id || restaurant.id || idx;
                      const name = restaurant.name || 'Restaurant';
                      const image = restaurant.image || 'https://via.placeholder.com/400x300?text=Restaurant';
                      const cuisines = Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : (restaurant.cuisine || 'Multi-Cuisine');
                      const priceRange = restaurant.priceRange || restaurant.price || '₹₹';
                      const rating = restaurant.rating || 4.5;
                      const locationArea = (restaurant.location && restaurant.location.area) || restaurant.location || 'City Center';
                      const deliveryTime = restaurant.deliveryTime || '30-45 min';
                      const features = restaurant.features || [];

                      return (
                        <Card
                          key={id}
                          className="restaurant-card"
                          sx={{
                            borderRadius: 3,
                            boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                            cursor: 'pointer',
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                            '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 14px 30px rgba(0,0,0,0.12)' },
                          }}
                          onClick={() => navigate(`/menu/${id}`)}
                        >
                          <CardMedia
                            component="img"
                            className="card-media"
                            image={image}
                            alt={name}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Restaurant'; }}
                          />
                          <CardContent className="card-content">
                            <div>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: darkGray, mb: 0.5 }}>{name}</Typography>
                              <Typography variant="body2" sx={{ color: grayText, fontSize: 14, mb: 1 }}>{cuisines}</Typography>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                              <div>
                                <Typography sx={{ fontWeight: 700, color: primaryRed }}>{priceRange}</Typography>
                                <Typography variant="caption" sx={{ display: 'block', color: grayText }}>📍 {locationArea}</Typography>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <StarIcon sx={{ color: '#FBBF24' }} />
                                <Typography sx={{ fontWeight: 600 }}>{rating}</Typography>
                              </div>
                            </div>

                            {features && features.length > 0 && (
                              <div style={{ marginTop: 10 }}>
                                <div style={{ display: 'inline-block', padding: '6px 10px', background: '#FEF3C7', borderRadius: 8 }}>
                                  <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 600 }}>{features[0]}</Typography>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* No Restaurants Found */}
                {!loading && !error && restaurants.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px'
                  }}>
                    <p style={{
                      color: grayText,
                      fontSize: '18px'
                    }}>
                      No restaurants found. Please add restaurants to your database.
                    </p>
                  </div>
                )}

                {/* View All Button */}
                {!loading && restaurants.length > 0 && (
                  <div style={{
                    textAlign: 'center',
                    marginTop: '24px'
                  }}>
                    <button
                      onClick={() => navigate('/restaurants')}
                      style={{
                        padding: '12px 28px',
                        backgroundColor: primaryRed,
                        color: 'white',
                        border: 'none',
                        borderRadius: '9999px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        boxShadow: '0 6px 18px rgba(220, 38, 38, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#b91c1c';
                        e.target.style.transform = 'scale(1.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = primaryRed;
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      View All Restaurants →
                    </button>
                  </div>
                )}
              </div>
            </section>
            {/* ===== End Dynamic Restaurant Cards Section ===== */}

        </MenuSection>
      </GlassyWrapper>
      <Footer />
    </Container>
  );
}
