"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { usePrivy } from "@privy-io/react-auth";
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import { useRouter } from "next/navigation";


const defaultPfps = [
  {
    name: "earth",
    src: "/default-pfps/pfp-earth.png",
    bg: "#B3A77E",
  },
  {
    name: "fire",
    src: "/default-pfps/pfp-fire.png",
    bg: "#FD8B44",
  },
  {
    name: "nature",
    src: "/default-pfps/pfp-nature.png",
    bg: "#BAC84F",
  },
  {
    name: "sun",
    src: "/default-pfps/pfp-sun.png",
    bg: "#FDED92",
  },
  {
    name: "water",
    src: "/default-pfps/pfp-water.png",
    bg: "#84EFF9",
  },
];

export default function OnboardingPage() {
  const [selectedPfp, setSelectedPfp] = useState<typeof defaultPfps[0] | null>(defaultPfps[0]);
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = usePrivy()
  const { createWallet } = useSolanaWallets();
  const router = useRouter();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImg(ev.target?.result as string);
        setSelectedPfp(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChooseDefault = (pfp: typeof defaultPfps[0]) => {
    setSelectedPfp(pfp);
    setUploadedImg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const privy_id = user?.id
    const email_address = user?.email?.address

    // Check if user already has a Solana wallet
    const solanaWallets = user?.linkedAccounts.filter((account) => {
      return (account as any).chainType === 'solana'
    }) || []

    let wallet_address: string | undefined;

    // If no Solana wallet exists, create one
    if (solanaWallets.length === 0) {
      try {
        const newWallet = await createWallet()
        wallet_address = newWallet?.address
        toast.success('Solana wallet created successfully!')
      } catch (error) {
        console.error('Error creating Solana wallet:', error)
        toast.error('Failed to create Solana wallet')
      }
    } else {
      wallet_address = solanaWallets.map(w => (w as any).address)[0]
    }

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privy_id: privy_id,
          email_address: email_address,
          username: username,
          bio: bio,
          wallet_address: wallet_address,
          avatar_type: selectedPfp ? 'default' : 'uploaded',
          avatar: selectedPfp ? selectedPfp.name : 'image_link' //TODO: fixed actual image upload
        })
      })

      const result = await response.json();

      if (!response.ok) {
        // Handle different error cases
        switch (response.status) {
          case 400:
            toast.error('Please fill in all required fields');
            break;
          case 409:
            toast.error('User already exists with this account');
            break;
          case 500:
            toast.error('Server error. Please try again later.');
            break;
          default:
            toast.error('An error occurred. Please try again.');
        }
        return; // Exit early on error
      }

      if (result.status === 'success') {
        localStorage.setItem('user_data', JSON.stringify({
          privy_id: result.user.privy_id,
          email: result.user.email,
          username: result.user.username,
        }))

        toast.success('Profile saved successfully!')
        router.push('/dashboard')
      }

    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="bg-background min-h-dvh w-dvw flex flex-col items-center px-6 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-2 mt-2">Update Profile</h1>
      <p className="text-lg text-foreground mb-6 text-center">Welcome! Let&apos;s set up your profile so friends can recognize you.</p>

      {/* Profile Picture Section */}
      <div className="flex flex-col items-center mb-6">
        <div
          className="relative flex items-center justify-center mb-2"
          style={{ background: selectedPfp?.bg || "#eee", borderRadius: 32, width: 140, height: 140 }}
        >
          <Image
            src={uploadedImg || selectedPfp?.src || defaultPfps[0].src}
            alt="Profile Picture"
            width={140}
            height={140}
            className="rounded-[32px] object-cover max-w-[140px] max-h-[140px]"
          />
          {/* <button
            className="absolute bottom-2 right-2 bg-background border border-foreground rounded-xl p-1 flex items-center justify-center shadow"
            onClick={() => fileInputRef.current?.click()}
            type="button"
            aria-label="Upload profile picture"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" /></svg>
          </button> */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
        <div className="flex gap-2 mt-2">
          {defaultPfps.map((pfp) => (
            <button
              key={pfp.name}
              type="button"
              className={`rounded-2xl border-2 ${selectedPfp?.name === pfp.name && !uploadedImg ? 'border-accent' : 'border-transparent'}`}
              style={{ background: pfp.bg }}
              onClick={() => handleChooseDefault(pfp)}
              aria-label={`Choose ${pfp.name} profile picture`}
            >
              <Image src={pfp.src} alt={pfp.name} width={40} height={40} className="rounded-xl object-cover" />
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 mt-1">Choose an icon
          {/* or upload your own */}
        </span>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSave} className="flex flex-col gap-4 w-full max-w-md">
        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-lg font-medium text-foreground">Username</label>
          <input
            id="username"
            className="rounded-xl px-4 py-3 bg-background border border-gray-300 text-lg text-foreground placeholder:text-gray-400 focus:outline-none focus:border-accent"
            placeholder="@user101"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="bio" className="text-lg font-medium text-foreground">Bio<span className="text-gray-400 text-base">(optional)</span></label>
          <textarea
            id="bio"
            className="rounded-xl px-4 py-3 bg-background border border-gray-300 text-lg text-foreground placeholder:text-gray-400 focus:outline-none focus:border-accent min-h-[80px]"
            placeholder="I like to game 🎮"
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-primary-button text-background text-lg font-semibold rounded-2xl py-3 w-full shadow-md hover:bg-[#fd7c1a] transition-colors"
        >
          Save
        </button>
      </form>
    </div>
  );
}