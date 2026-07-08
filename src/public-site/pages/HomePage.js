import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../styles/globals.css';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Pricing from '../components/Pricing';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    const role = user?.role;
    const roles = user?.roles || [];
    const isAdmin = role === 'ADMIN' || roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
    navigate(isAdmin ? '/admin/plans' : '/dashboard', { replace: true });
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
