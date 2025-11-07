const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

// Password hashing
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// User helpers
const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  return { data, error };
};

const findUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

const createUser = async (userData) => {
  // Hash password if provided
  if (userData.password) {
    userData.password = await hashPassword(userData.password);
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();
  
  return { data, error };
};

const updateUser = async (id, updates) => {
  // Check if profile is completed
  if (updates.offer_skill && updates.want_skill) {
    updates.profile_completed = true;
  }
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Match helpers
const findMatchesByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user1:user1_id(*),
      user2:user2_id(*)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

const findMatchById = async (matchId) => {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      user1:user1_id(*),
      user2:user2_id(*)
    `)
    .eq('id', matchId)
    .single();
  
  return { data, error };
};

const createMatch = async (matchData) => {
  const { data, error } = await supabase
    .from('matches')
    .insert([matchData])
    .select()
    .single();
  
  return { data, error };
};

const updateMatch = async (matchId, updates) => {
  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', matchId)
    .select()
    .single();
  
  return { data, error };
};

// Classroom helpers
const createClassroom = async (classroomData) => {
  const { data, error } = await supabase
    .from('classrooms')
    .insert([classroomData])
    .select()
    .single();
  
  return { data, error };
};

const findClassroomByMatchId = async (matchId) => {
  const { data, error } = await supabase
    .from('classrooms')
    .select(`
      *,
      match:match_id(
        *,
        user1:user1_id(*),
        user2:user2_id(*)
      )
    `)
    .eq('match_id', matchId)
    .single();
  
  return { data, error };
};

const updateClassroom = async (matchId, updates) => {
  const { data, error } = await supabase
    .from('classrooms')
    .update(updates)
    .eq('match_id', matchId)
    .select()
    .single();
  
  return { data, error };
};

// Review helpers
const createReview = async (reviewData) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([reviewData])
    .select()
    .single();
  
  return { data, error };
};

const findReviewsByUserId = async (userId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      from_user:from_user_id(name, avatar),
      to_user:to_user_id(name, avatar)
    `)
    .eq('to_user_id', userId);
  
  return { data, error };
};

// Update user trust score based on reviews
const updateUserTrustScore = async (userId) => {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating_teaching, rating_exchange')
    .eq('to_user_id', userId);
  
  if (reviews && reviews.length > 0) {
    const avgTeaching = reviews.reduce((sum, r) => sum + (r.rating_teaching || 0), 0) / reviews.length;
    const avgExchange = reviews.reduce((sum, r) => sum + (r.rating_exchange || 0), 0) / reviews.length;
    const trustScore = ((avgTeaching + avgExchange) / 2).toFixed(1);
    
    await supabase
      .from('users')
      .update({ 
        trust_score: trustScore,
        total_reviews: reviews.length
      })
      .eq('id', userId);
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  findMatchesByUserId,
  findMatchById,
  createMatch,
  updateMatch,
  createClassroom,
  findClassroomByMatchId,
  updateClassroom,
  createReview,
  findReviewsByUserId,
  updateUserTrustScore
};
