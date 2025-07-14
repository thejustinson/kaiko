"use client";

import Image from 'next/image'
import { motion, AnimatePresence } from "framer-motion";
import { RiCloseLine, RiArrowLeftLine } from '@remixicon/react';
import { useEffect, useState } from 'react';
import {useLoginWithEmail, usePrivy} from '@privy-io/react-auth';
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const {sendCode, loginWithCode} = useLoginWithEmail();
  const { authenticated, user } = usePrivy();
  const router = useRouter()

  const handleGetStarted = () => {
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setLoginStep('email');
    setEmail('');
  };

  const handleEmailSubmit = () => {
    if (email.trim()) {
      sendCode({email})
      setLoginStep('otp');
    }
  };

  const handleBackToEmail = () => {
    setLoginStep('email');
  };

  useEffect(() => {
    if (authenticated && user) {
      const privyId = user.id;

      fetch(`/api/users/fetch?privyId=${privyId}&intent=confirm`)
        .then(async (res) => {
          const data = await res.json();
          if (data.exists) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding')
          }
        })
        .catch((err) => {
          console.error('Error confirming user:', err);
        });
    }
  }, [authenticated, user, router]);

  return (
    <div className="h-dvh w-dvw bg-accent relative">

      <div className="h-1/2 flex w-dvw justify-center items-center relative">

        <div>
          <Image
            src={'/auth-icon.svg'}
            alt='sitting player'
            width={300}
            height={300}
            className='absolute z-10 left-[calc(50%-150px)] -bottom-8'
          />
        </div>
      </div>

      <div className="absolute h-1/2 w-full bg-background bottom-0 rounded-t-4xl px-5 flex flex-col justify-center items-center text-center gap-3">
        <p className="text-3xl font-bold">Connect, Chat and Play with Friends</p>
        <p className="text-fade">Jump into quick games, banter with frens, and rack up points while you chill.</p>
        <button 
          onClick={handleGetStarted}
          className="bg-primary-button text-secondary-foreground text-lg w-[281px] h-[58px] rounded-2xl mt-5"
        >
          Get Started
        </button>
      </div>

      <AnimatePresence>
        {showLoginModal && (
          <LoginModal 
            onClose={handleCloseModal}
            step={loginStep}
            email={email}
            setEmail={setEmail}
            onEmailSubmit={handleEmailSubmit}
            onBackToEmail={handleBackToEmail}
            loginWithCode = {loginWithCode}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface LoginModalProps {
  onClose: () => void;
  step: 'email' | 'otp';
  email: string;
  setEmail: (email: string) => void;
  onEmailSubmit: () => void;
  onBackToEmail: () => void;
  loginWithCode: (params: { code: string }) => Promise<void>;
}

function LoginModal({ onClose, step, email, setEmail, onEmailSubmit, onBackToEmail,
  loginWithCode }: LoginModalProps) {

    const [code, setCode] = useState('')

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 30 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className='bg-background absolute top-0 h-dvh w-dvw z-50 rounded-t-3xl p-5'
    >
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Login</h1>
        <button onClick={onClose} className="p-2 hover:bg-accent/20 rounded-lg transition-colors">
          <RiCloseLine size={24} />
        </button>
      </div>

      <div className='bg-accent h-[1px] w-full my-5'></div>

      <AnimatePresence mode="wait">
        {step === 'email' ? (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className='flex flex-col gap-3'
          >
            <label htmlFor="email_address">Email</label>
            <input
              className='bg-accent/20 w-full px-3 py-3 rounded-lg border border-accent/30 focus:border-accent focus:outline-none'
              id='email_address'
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <button 
              onClick={onEmailSubmit}
              disabled={!email.trim()}
              className='bg-primary-button py-3 text-secondary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-button/90 transition-colors'
            >
              Get Code
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className='flex flex-col gap-3'
          >
            <div className="flex items-center gap-2 mb-2">
              <button 
                onClick={onBackToEmail}
                className="p-2 hover:bg-accent/20 rounded-lg transition-colors"
              >
                <RiArrowLeftLine size={20} />
              </button>
              <span className="text-sm text-accent">Back to email</span>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-accent mb-1">Code sent to:</p>
              <p className="font-medium">{email}</p>
            </div>

            <label htmlFor="otp_code">Enter Code</label>
            <input
              className='bg-accent/20 w-full px-3 py-3 rounded-lg border border-accent/30 focus:border-accent focus:outline-none'
              id='otp_code'
              type="text"
              placeholder="Enter 6-digit code"
              maxLength={6}
              onChange={(e)=>{
                setCode(e.currentTarget.value)
              }}
              value={code}
            />
            <button className='bg-primary-button py-3 text-secondary-foreground rounded-lg hover:bg-primary-button/90 transition-colors'
              onClick={()=>{
                loginWithCode({code})
              }}
            >
              Verify
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}