import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/articles${selectedCategory ? `?category=${selectedCategory}` : ''}`);
        setArticles(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please try again later.');
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/articles/categories/all');
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchArticles();
    fetchCategories();
  }, [selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // If no articles exist yet, let's provide some sample data
  if (articles.length === 0 && !error) {
    const sampleArticles = [
      {
        _id: 'sample1',
        title: 'A Visual Guide to Understanding Your Period',
        content: 'Understanding your menstrual cycle is crucial for your overall health...',
        author: 'Dr. Emma Johnson',
        category: 'Article',
        imageUrl: 'https://via.placeholder.com/300x200'
      },
      {
        _id: 'sample2',
        title: 'Breaking Taboos and Starting Conversations about Menstruation',
        content: 'Menstruation is a natural process, yet it remains stigmatized in many cultures...',
        author: 'Sarah Williams',
        category: 'Article',
        imageUrl: 'https://via.placeholder.com/300x200'
      },
      {
        _id: 'sample3',
        title: 'Taking Control of Your Menstrual Health: Key Factors for a Balanced Cycle',
        content: 'Your menstrual cycle is influenced by many factors, including diet, exercise...',
        author: 'Dr. Michael Chen',
        category: 'Health',
        imageUrl: 'https://via.placeholder.com/300x200'
      },
      {
        _id: 'sample4',
        title: 'The Best Foods and Drinks for a Healthy Period',
        content: 'What you eat can significantly impact your menstrual health...',
        author: 'Nutritionist Lisa Park',
        category: 'Food & Drink',
        imageUrl: 'https://via.placeholder.com/300x200'
      },
      {
        _id: 'sample5',
        title: 'Yoga Practices for a Harmonious Menstrual Cycle',
        content: 'Certain yoga poses can help alleviate period pain and promote balance...',
        author: 'Yoga Instructor Maya Patel',
        category: 'Yoga',
        imageUrl: 'https://via.placeholder.com/300x200'
      },
      {
        _id: 'sample6',
        title: 'Tried and Tested Tips for Managing Your Menstruation',
        content: 'From period tracking to pain management, here are practical tips...',
        author: 'Health Editor Jessica Brown',
        category: 'Tips & Tricks',
        imageUrl: 'https://via.placeholder.com/300x200'
      }
    ];

    return (
      <div className="articles">
        <h2>Expert Insights</h2>
        
        <div className="category-filter">
          <button 
            className={!selectedCategory ? 'active' : ''} 
            onClick={() => handleCategoryChange('')}
          >
            Discover
          </button>
          
          {['Tips & Tricks', 'Video', 'Article', 'Health', 'Yoga', 'Exercise', 'Medicine', 'Mood', 'Food & Drink', 'Activity'].map(category => (
            <button 
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="article-grid">
          {sampleArticles
            .filter(article => !selectedCategory || article.category === selectedCategory)
            .map(article => (
              <div key={article._id} className="article-card">
                <div className="article-image">
                  <img src={article.imageUrl} alt={article.title} />
                </div>
                <div className="article-content">
                  <h3>{article.title}</h3>
                  <p>{article.content.substring(0, 100)}...</p>
                  <div className="article-meta">
                    <span className="article-author">By {article.author}</span>
                    <span className="article-category">{article.category}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <p className="sample-note">These are sample articles. Connect your application to the backend to see real articles.</p>
      </div>
    );
  }

  return (
    <div className="articles">
      <h2>Expert Insights</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="category-filter">
        <button 
          className={!selectedCategory ? 'active' : ''} 
          onClick={() => handleCategoryChange('')}
        >
          All
        </button>
        
        {categories.map(category => (
          <button 
            key={category}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {articles.length === 0 ? (
        <p>No articles found. Try selecting a different category.</p>
      ) : (
        <div className="article-grid">
          {articles.map(article => (
            <div key={article._id} className="article-card">
              {article.imageUrl && (
                <div className="article-image">
                  <img src={article.imageUrl} alt={article.title} />
                </div>
              )}
              <div className="article-content">
                <h3>{article.title}</h3>
                <p>{article.content.substring(0, 100)}...</p>
                <div className="article-meta">
                  <span className="article-author">By {article.author}</span>
                  <span className="article-category">{article.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles; 