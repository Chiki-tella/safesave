import { Award, Trophy, Star, Target, Lock, CheckCircle, TrendingUp, Users, Calendar } from 'lucide-react';

const badges = [
  {
    id: 1,
    name: 'First Deposit',
    description: 'Made your first savings deposit',
    icon: Star,
    color: 'bg-amber-400',
    unlocked: true,
    date: 'Jan 15, 2025'
  },
  {
    id: 2,
    name: 'Consistent Saver',
    description: 'Saved for 10 consecutive weeks',
    icon: Calendar,
    color: 'bg-emerald-400',
    unlocked: true,
    date: 'Mar 20, 2025'
  },
  {
    id: 3,
    name: 'Loan Repaid',
    description: 'Successfully repaid a loan',
    icon: CheckCircle,
    color: 'bg-blue-400',
    unlocked: true,
    date: 'May 5, 2025'
  },
  {
    id: 4,
    name: 'Top Saver',
    description: 'Ranked #1 in monthly savings',
    icon: Trophy,
    color: 'bg-purple-400',
    unlocked: true,
    date: 'Jun 1, 2025'
  },
  {
    id: 5,
    name: 'Investment Pioneer',
    description: 'Participate in 3 group investments',
    icon: TrendingUp,
    color: 'bg-indigo-400',
    unlocked: false,
    progress: 2,
    total: 3
  },
  {
    id: 6,
    name: 'Community Builder',
    description: 'Invite 5 members to the group',
    icon: Users,
    color: 'bg-pink-400',
    unlocked: false,
    progress: 1,
    total: 5
  },
  {
    id: 7,
    name: 'Savings Champion',
    description: 'Save ₳10,000 total',
    icon: Target,
    color: 'bg-cyan-400',
    unlocked: false,
    progress: 5240,
    total: 10000
  },
  {
    id: 8,
    name: 'Diamond Member',
    description: 'Save for 52 consecutive weeks',
    icon: Award,
    color: 'bg-rose-400',
    unlocked: false,
    progress: 12,
    total: 52
  },
];

const leaderboard = [
  { rank: 1, name: 'Alice M.', points: 4850, badges: 8 },
  { rank: 2, name: 'You', points: 4200, badges: 4 },
  { rank: 3, name: 'Bob K.', points: 3920, badges: 6 },
  { rank: 4, name: 'Carol S.', points: 3450, badges: 5 },
  { rank: 5, name: 'David P.', points: 3180, badges: 4 },
];

export function RewardsPage() {
  const unlockedBadges = badges.filter(b => b.unlocked).length;
  const totalBadges = badges.length;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-6 pt-12 pb-8 rounded-b-[2rem]">
        <h2 className="text-white mb-2">Rewards & Badges</h2>
        <p className="text-purple-100">Earn NFT badges for your achievements</p>
      </div>

      {/* Stats Card */}
      <div className="px-6 -mt-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-slate-600 mb-1">Your Points</p>
              <h1 className="text-purple-600">4,200</h1>
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-emerald-700 text-sm mb-1">Badges Earned</p>
              <h3 className="text-emerald-800">{unlockedBadges}/{totalBadges}</h3>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-amber-700 text-sm mb-1">Rank</p>
              <h3 className="text-amber-800">#2</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="px-6 mb-8">
        <h4 className="text-slate-800 mb-4">Your Badges</h4>
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge) => {
            const BadgeIcon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`bg-white rounded-2xl shadow-md p-5 ${
                  !badge.unlocked ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-14 h-14 ${badge.color} rounded-2xl flex items-center justify-center relative`}>
                    <BadgeIcon className="w-7 h-7 text-white" />
                    {!badge.unlocked && (
                      <div className="absolute inset-0 bg-slate-900/30 rounded-2xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  {badge.unlocked && (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                </div>

                <h4 className="text-slate-800 mb-1">{badge.name}</h4>
                <p className="text-slate-600 text-sm mb-3">{badge.description}</p>

                {badge.unlocked ? (
                  <div className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-lg inline-block">
                    Earned {badge.date}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-600 text-xs">Progress</span>
                      <span className="text-slate-800 text-xs">
                        {badge.progress}/{badge.total}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${badge.color} rounded-full`}
                        style={{ width: `${(badge.progress! / badge.total!) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h4 className="text-slate-800">Top Savers Leaderboard</h4>
        </div>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {leaderboard.map((member) => (
            <div
              key={member.rank}
              className={`p-5 flex items-center justify-between ${
                member.name === 'You' ? 'bg-purple-50' : ''
              } ${member.rank !== leaderboard.length ? 'border-b border-slate-100' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    member.rank === 1
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500'
                      : member.rank === 2
                      ? 'bg-gradient-to-br from-slate-300 to-slate-400'
                      : member.rank === 3
                      ? 'bg-gradient-to-br from-amber-600 to-amber-700'
                      : 'bg-slate-400'
                  }`}
                >
                  <span>#{member.rank}</span>
                </div>
                <div>
                  <p className={`${member.name === 'You' ? 'text-purple-700' : 'text-slate-800'}`}>
                    {member.name}
                  </p>
                  <p className="text-slate-500 text-sm">{member.badges} badges earned</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-800">{member.points}</p>
                <p className="text-slate-500 text-sm">points</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Badge */}
      <div className="px-6 mb-8">
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-amber-100 text-sm">Next Badge</p>
              <h4>Investment Pioneer</h4>
            </div>
          </div>
          <p className="text-amber-100 mb-4">Join 1 more group investment to unlock!</p>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '67%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
