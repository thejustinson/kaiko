"use client"

import { useState, useEffect } from "react"
import {
  RiSearch2Line,
  RiPushpinFill
} from "@remixicon/react"
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";

// Data types
interface Game {
  id: string;
  name: string;
  icon: string
  // Add other fields as needed
}

interface Conversation {
  id: string;
  username: string;
  image: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isPinned: boolean;
}

interface TabOption {
  id: string;
  label: string;
}

// Types for API response
interface HubApiChat {
  id: string;
  name?: string;
  lastMessage?: {
    content?: string;
    created_at?: string;
  };
  unreadCount?: number;
  // Add more fields as needed
}

interface HubApiResponse {
  status: string;
  user: unknown;
  friends: unknown;
  games: Game[];
  sessions: unknown;
  chats: HubApiChat[];
}

// Tab options for filtering conversations
const tabOptions: TabOption[] = [
  { id: "all", label: "All" },
  { id: "groups", label: "Groups" },
  { id: "online", label: "Online" },
  { id: "requests", label: "Requests" },
]

export default function Hub() {
  // State for hub data
  const [games, setGames] = useState<Game[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")
  const { user } = usePrivy()


  // Fetch hub data on mount
  useEffect(() => {
    async function fetchHubData() {
      setLoading(true)
      setError(null)
      try {
        // Fetch hub data from API
        // In production, privy_id should come from the user's session/auth context
        const privy_id = user?.id

        if (privy_id) {
          const res = await fetch(`/api/users/fetch?privy_id=${privy_id}&intent=fetch-hub-data`)
          if (!res.ok) throw new Error("Failed to fetch hub data")
          const data: HubApiResponse = await res.json()

          // Set games
          setGames(data.games || [])

          // Transform chats to Conversation[] for UI
          const conversations: Conversation[] = (data.chats || []).map((chat: HubApiChat): Conversation => ({
            id: chat.id,
            username: chat.name || "Unknown", // TODO: Use participant name for direct chats
            image: "/default-pfps/pfp-earth.png", // TODO: Use real avatar if available
            lastMessage: chat.lastMessage?.content || "No messages yet",
            timestamp: chat.lastMessage?.created_at ? new Date(chat.lastMessage.created_at).toLocaleTimeString() : "",
            unreadCount: chat.unreadCount || 0,
            isPinned: false // TODO: Add pinning logic if needed
          }))
          setConversations(conversations)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchHubData()
  }, [user])

  const handleSearch = (): void => {
    console.log("Search clicked")
  }

  const handleProfile = (): void => {
    console.log("Profile clicked")
  }

  // --- UI rendering ---
  return (
    <div className="bg-background w-dvw h-dvh flex flex-col overflow-y-scroll">
      <Header onSearch={handleSearch} onProfile={handleProfile} />
      {/* Show skeleton, error, or main content */}
      {loading ? (
        <>
          <SkeletonGames />
          <SkeletonConversations />
        </>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>
      ) : (
        <>
          <ExploreGames games={games} />
          <Conversations
            conversations={conversations}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </>
      )}
    </div>
  )
}

// --- Skeleton Loaders ---
// Simple animated skeleton for games grid
function SkeletonGames() {
  return (
    <section className="px-5 py-4">
      <div className="w-full flex justify-between items-center mb-3">
        <div className="h-6 w-32 bg-accent/40 rounded animate-pulse" />
        <div className="h-5 w-16 bg-accent/40 rounded animate-pulse" />
      </div>
      <div className="flex gap-x-3 items-center">
        {[1,2,3,4].map(i => (
          <div key={i} className="w-20 h-20 rounded-3xl bg-accent/40 animate-pulse" />
        ))}
      </div>
    </section>
  )
}

// Simple animated skeleton for chat list
function SkeletonConversations() {
  return (
    <section className="w-full grow bg-accent/20 px-1 py-5 pt-1 rounded-t-4xl">
      <div className="px-8 py-4">
        <div className="flex w-full justify-between">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-5 w-16 bg-accent/40 rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="bg-background w-full py-3 px-4 rounded-4xl">
        {[1,2].map(i => (
          <div key={i} className="flex items-center gap-x-4 py-3">
            <div className="w-[60px] h-[60px] bg-accent/40 rounded-full animate-pulse" />
            <div className="flex-1 flex flex-col gap-y-2">
              <div className="h-4 w-32 bg-accent/40 rounded animate-pulse" />
              <div className="h-3 w-24 bg-accent/30 rounded animate-pulse" />
            </div>
            <div className="flex flex-col items-end gap-y-2">
              <div className="h-3 w-12 bg-accent/40 rounded animate-pulse" />
              <div className="h-5 w-5 bg-accent/40 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-background w-full py-3 px-4 rounded-4xl mt-3">
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center gap-x-4 py-3">
            <div className="w-[60px] h-[60px] bg-accent/40 rounded-full animate-pulse" />
            <div className="flex-1 flex flex-col gap-y-2">
              <div className="h-4 w-32 bg-accent/40 rounded animate-pulse" />
              <div className="h-3 w-24 bg-accent/30 rounded animate-pulse" />
            </div>
            <div className="flex flex-col items-end gap-y-2">
              <div className="h-3 w-12 bg-accent/40 rounded animate-pulse" />
              <div className="h-5 w-5 bg-accent/40 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

type HeaderProps = {
  onSearch: () => void;
  onProfile: () => void;
}
function Header({ onSearch, onProfile }: HeaderProps) {
  return (
    <header className="flex px-5 py-5 justify-between items-center">
      <h1 className="text-2xl font-semibold">Kaiko</h1>
      <div className="flex gap-x-3 items-center">
        <button
          className="p-3 bg-accent/20 rounded-full hover:bg-accent/30 transition-colors"
          onClick={onSearch}
          aria-label="Search"
        >
          <RiSearch2Line />
        </button>
        <button
          className="text-secondary-foreground bg-gradient-to-r from-accent to-primary-button px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
          onClick={onProfile}
        >
          Profile
        </button>
      </div>
    </header>
  )
}

type ExploreGamesProps = {
  games: Game[];
}
function ExploreGames({ games }: ExploreGamesProps) {
  const handleGameClick = (gameId: string): void => {
    console.log(`Game ${gameId} clicked`)
  }

  const handleViewAll = (): void => {
    console.log("View all games clicked")
  }

  // Show empty state if no games
  if (!games.length) {
    return (
      <section className="px-5 py-8 text-center text-foreground/60">No games available.</section>
    )
  }

  return (
    <section className="px-5">
      <div className="w-full flex justify-between items-center">
        <h2 className="font-semibold">Explore Games</h2>
        <button
          className="text-sm text-foreground hover:text-foreground/80 transition-colors"
          onClick={handleViewAll}
        >
          View All
        </button>
      </div>
      <div className="mt-3 mb-5 flex gap-x-3 items-center">
        {games.map((game: Game) => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => handleGameClick(game.id)}
          />
        ))}
      </div>
    </section>
  )
}

type GameCardProps = {
  game: Game;
  onClick: () => void;
}
function GameCard({ game, onClick }: GameCardProps) {
  return (
    <button
      className="group"
      onClick={onClick}
      aria-label={`Play ${game.name}`}
    >
      <div className="w-20 h-20 rounded-3xl bg-accent group-hover:bg-accent/80 transition-colors">
        <Image
          src={game.icon}
          alt={`${game.name} icon`}
          width={80}
          height={80}
          className="rounded-3xl"
        />
      </div>
    </button>
  )
}

type ConversationsProps = {
  conversations: Conversation[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}
function Conversations({ conversations, activeTab, onTabChange }: ConversationsProps) {
  // TODO: Filter conversations by tab (e.g. groups, online, requests)
  const pinnedConversations = conversations.filter((conv: Conversation) => conv.isPinned)
  const regularConversations = conversations.filter((conv: Conversation) => !conv.isPinned)

  // Show empty state if no conversations
  if (!conversations.length) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center text-foreground/60 py-12">
        <div className="text-lg mb-2">No chats yet.</div>
        <div className="text-sm">Add a friend to start texting.</div>
      </section>
    )
  }

  return (
    <div className="w-full grow bg-accent/20 px-1 py-5 pt-1 rounded-t-4xl">
      <ConversationTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        options={tabOptions}
      />
      {pinnedConversations.length > 0 && (
        <ConversationSection
          title="Pinned Chats"
          conversations={pinnedConversations}
          showPinIcon={true}
          showDividers={true}
        />
      )}
      <ConversationSection
        conversations={regularConversations}
        showDividers={true}
        showPinIcon={false}
      />
    </div>
  )
}

type ConversationTabsProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
  options: TabOption[];
}
function ConversationTabs({ activeTab, onTabChange, options }: ConversationTabsProps) {
  return (
    <nav className="px-8 py-4">
      <ul className="flex w-full justify-between text-foreground/75" role="tablist">
        {options.map((option: TabOption) => (
          <li key={option.id} role="presentation">
            <button
              role="tab"
              aria-selected={activeTab === option.id}
              className={`transition-colors ${activeTab === option.id
                  ? 'text-foreground font-medium'
                  : 'hover:text-foreground/90'
                }`}
              onClick={() => onTabChange(option.id)}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

type ConversationSectionProps = {
  title?: string;
  conversations: Conversation[];
  showPinIcon?: boolean;
  showDividers?: boolean;
}
function ConversationSection({ title, conversations, showPinIcon = false, showDividers = false }: ConversationSectionProps) {
  return (
    <section className={`bg-background w-full py-3 px-4 rounded-4xl ${title ? '' : 'mt-3'}`}>
      {title && (
        <h3 className="flex items-center gap-1 text-sm text-foreground/75 mb-2">
          {showPinIcon && <RiPushpinFill size={16} />}
          {title}
        </h3>
      )}
      <div className="flex flex-col">
        {conversations.map((conversation: Conversation, index: number) => (
          <div key={conversation.id}>
            <ConversationItem conversation={conversation} />
            {showDividers && index < conversations.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </section>
  )
}

type ConversationItemProps = {
  conversation: Conversation;
}
function ConversationItem({ conversation }: ConversationItemProps) {
  const handleClick = (): void => {
    console.log(`Conversation with ${conversation.username} clicked`)
  }

  return (
    <button
      className="w-full py-3 flex items-center gap-x-4 hover:bg-accent/10 rounded-lg transition-colors text-left"
      onClick={handleClick}
      aria-label={`Chat with ${conversation.username}`}
    >
      <div className="w-[60px] h-[60px] bg-[#B3A77E] rounded-full grow-0 shrink-0">
        <Image
          src={`${conversation.image}`}
          alt={`${conversation.username} Image`}
          width={60}
          height={60}
          className="rounded-full"
        />
      </div>
      <div className="w-full flex justify-between min-w-0">
        <div className="flex flex-col gap-y-1 min-w-0">
          <span className="font-semibold truncate">{conversation.username}</span>
          <span className="text-sm text-foreground/60 truncate">{conversation.lastMessage}</span>
        </div>
        <div className="flex flex-col justify-between items-end shrink-0">
          <span className="text-sm text-foreground/75">{conversation.timestamp}</span>
          {conversation.unreadCount > 0 && (
            <span className="text-secondary-foreground text-sm bg-accent h-5 w-5 rounded-full flex justify-center items-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function Divider() {
  return (
    <div className="flex justify-end">
      <div className="h-[1px] w-[80%] bg-foreground/30"></div>
    </div>
  )
}