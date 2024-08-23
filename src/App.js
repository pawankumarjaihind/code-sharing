import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Import CSS file for styles

const BASE_URL = "https://code-sharing-backend.vercel.app"; // Assuming you have defined this environment variable

function App() {
  const [message, setMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSave = async () => {
    try {

      // Send the message to the backend along with the device ID
      await saveMessage(message);

      alert('Message saved!');
    } catch (error) {
      console.error('Error saving message:', error);
      alert('Failed to save message. Please try again.');
    }
  };

  const saveMessage = async (message) => {
    try {
      let deviceId = getCookie('deviceId'); // Get deviceId from cookies
      // If deviceId cookie doesn't exist, generate a new one
      if (!deviceId) {
        deviceId = generateDeviceId();
        document.cookie = `deviceId=${deviceId}; max-age=${365 * 24 * 60 * 60}`; // Set cookie to expire in 1 year
      }
      
      await axios.post(`${BASE_URL}/add-message`, { deviceId, message }); // Send the message to the backend
    } catch (error) {
      throw new Error('Error saving message:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    alert('Message copied to clipboard!');
  };

  const clearText = () => {
    setMessage('');
  }

  const fetchRecentMessage = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/recent-message`);
      if (response.data.success) {
        setMessage(response.data.message);
        const formattedDate = formatDate(response.data.updatedAt);
        setLastUpdated(formattedDate);
      } else {
        console.error('Failed to fetch recent message:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching recent message:', error);
    }
  };

  useEffect(() => {
    fetchRecentMessage();
  }, []);

  const getCookie = (name) => {
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : null;
  };

  const generateDeviceId = () => {
    return Math.random().toString(36).substr(2, 10);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}-${hour}-${minute}-${second}`;
    return formattedDate;
};

  return (
    <div className="container">
      <div className="heading">
        <div className="last-updated">Last Updated At: {lastUpdated}</div>
        <h2>Code Sharing Box</h2>
        <button className="copy-button" onClick={handleCopy}>Copy to Clipboard</button>
      </div>
      <textarea
        className="textarea"
        value={message}
        onChange={handleChange}
        placeholder="Enter your message here..."
        rows={10}
        cols={50}
      />
      <br />
      <button className="button" onClick={handleSave}>Save Message</button>
      <button className="button" onClick={clearText}>Clear Message</button>
    </div>
  );
}

export default App;
