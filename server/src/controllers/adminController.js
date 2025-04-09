// Obține activitatea recentă
exports.getRecentActivity = async (req, res) => {
  try {
    // Obținem ultimele 10 activități din fiecare categorie
    const [newUsers, newBirds, newFavorites, newQuizzes] = await Promise.all([
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username createdAt'),
      Bird.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt'),
      Favorite.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'username')
        .populate('bird', 'name'),
      Quiz.find({})
        .sort({ completedAt: -1 })
        .limit(5)
        .populate('user', 'username')
    ]);

    // Combinăm și sortăm toate activitățile
    const activities = [
      ...newUsers.map(user => ({
        type: 'USER_REGISTERED',
        timestamp: user.createdAt,
        data: { username: user.username }
      })),
      ...newBirds.map(bird => ({
        type: 'BIRD_ADDED',
        timestamp: bird.createdAt,
        data: { birdName: bird.name }
      })),
      ...newFavorites.map(fav => ({
        type: 'FAVORITE_ADDED',
        timestamp: fav.createdAt,
        data: { 
          username: fav.user.username,
          birdName: fav.bird.name
        }
      })),
      ...newQuizzes.map(quiz => ({
        type: 'QUIZ_COMPLETED',
        timestamp: quiz.completedAt,
        data: { 
          username: quiz.user.username,
          score: quiz.score
        }
      }))
    ].sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Eroare la obținerea activității recente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la obținerea activității recente' 
    });
  }
};

// Obține statisticile sistemului
exports.getSystemStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Obținem statistici pentru ultimele 30 de zile
    const [dailyUsers, dailyBirds, dailyQuizzes] = await Promise.all([
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { 
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$createdAt" 
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Bird.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { 
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$createdAt" 
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Quiz.aggregate([
        {
          $match: {
            completedAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { 
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$completedAt" 
              }
            },
            averageScore: { $avg: "$score" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        dailyUsers,
        dailyBirds,
        dailyQuizzes
      }
    });
  } catch (error) {
    console.error('Eroare la obținerea statisticilor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la obținerea statisticilor' 
    });
  }
}; 