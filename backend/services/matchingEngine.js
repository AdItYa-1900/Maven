const User = require('../models/User');
const Match = require('../models/Match');
const { getTimezoneOffset, calculateTimezoneProximity } = require('../utils/timezoneHelper');

// Calculate skill similarity score
const calculateSkillSimilarity = (skill1, skill2) => {
  const s1 = skill1.toLowerCase().trim();
  const s2 = skill2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 100;
  
  // Contains check
  if (s1.includes(s2) || s2.includes(s1)) return 80;
  
  // Word overlap
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));
  
  if (commonWords.length > 0) {
    return 50 + (commonWords.length * 10);
  }
  
  return 0;
};

// Calculate level match score
const calculateLevelScore = (level1, level2) => {
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const diff = Math.abs(levels.indexOf(level1) - levels.indexOf(level2));
  
  if (diff === 0) return 100;
  if (diff === 1) return 70;
  return 40;
};

// Find matches for a specific user
const findMatchesForUser = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user || !user.profile_completed) {
    return [];
  }

  // Find all users except self with completed profiles
  const potentialMatches = await User.find({
    _id: { $ne: userId },
    profile_completed: true
  });

  const matches = [];

  for (const candidate of potentialMatches) {
    // Check if already matched
    const existingMatch = await Match.findOne({
      $or: [
        { user1_id: userId, user2_id: candidate._id },
        { user1_id: candidate._id, user2_id: userId }
      ],
      status: { $in: ['pending', 'active'] }
    });

    if (existingMatch) continue;

    // Calculate match scores
    const offerMatchScore = calculateSkillSimilarity(user.offer_skill, candidate.want_skill);
    const wantMatchScore = calculateSkillSimilarity(user.want_skill, candidate.offer_skill);

    // Only consider if both directions have reasonable match
    if (offerMatchScore >= 50 && wantMatchScore >= 50) {
      const offerLevelScore = calculateLevelScore(user.offer_level, candidate.want_level);
      const wantLevelScore = calculateLevelScore(user.want_level, candidate.offer_level);
      
      const timezoneScore = calculateTimezoneProximity(user.timezone, candidate.timezone);

      // Calculate overall match score
      const matchScore = (
        (offerMatchScore + wantMatchScore) * 0.4 +
        (offerLevelScore + wantLevelScore) * 0.3 +
        timezoneScore * 0.3
      );

      matches.push({
        candidate,
        matchScore,
        details: {
          offerMatchScore,
          wantMatchScore,
          offerLevelScore,
          wantLevelScore,
          timezoneScore
        }
      });
    }
  }

  // Sort by match score
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
};

// Create match entries
const createMatch = async (user1Id, user2Id, matchScore, skillMatch) => {
  const match = new Match({
    user1_id: user1Id,
    user2_id: user2Id,
    match_score: matchScore,
    skill_match: skillMatch,
    status: 'pending'
  });

  await match.save();
  return match;
};

// Run matching engine for all users or specific user
const runMatchingEngine = async (specificUserId = null) => {
  try {
    let users;
    
    if (specificUserId) {
      users = [await User.findById(specificUserId)];
    } else {
      users = await User.find({ profile_completed: true });
    }

    let totalMatches = 0;

    for (const user of users) {
      const matches = await findMatchesForUser(user._id);
      
      // Create match for top 3 candidates
      for (const match of matches.slice(0, 3)) {
        const user2 = await User.findById(user._id);
        
        await createMatch(
          user._id,
          match.candidate._id,
          match.matchScore,
          {
            user1_teaches: user.offer_skill,
            user1_learns: user.want_skill,
            user2_teaches: match.candidate.offer_skill,
            user2_learns: match.candidate.want_skill
          }
        );

        totalMatches++;
      }
    }

    console.log(`✅ Matching engine completed: ${totalMatches} new matches created`);
    return totalMatches;
  } catch (error) {
    console.error('❌ Matching engine error:', error);
    return 0;
  }
};

module.exports = {
  findMatchesForUser,
  runMatchingEngine,
  createMatch
};
