import React from 'react';
import './Overlaydashboard.css';

export const Overlaydashboard = ({ userInfo, onClose }) => {
  if (!userInfo) return null;

  const { username, info } = userInfo;

  return (
    <div className='overlay_parent'>
      <div className='overlay_parent_child'>
        <div className='closebtndiv'>
          <button className='closeoverlay' onClick={onClose}></button>
        </div>
        <h1>{username}'s PC Info</h1>
        <div className='statscontainer'>
          <div className='statsbox'>
            <h2>CPU</h2>
            <p>Physical Cores: {info.cpu.physical_cores}</p>
            <p>Total Cores: {info.cpu.total_cores}</p>
            <p>Frequency: {info.cpu.frequency.current} MHz</p>
            <p>Usage: {info.cpu.usage}%</p>
          </div>
          <div className='statsbox' id='gpuinfodash'>
          <h2>GPU</h2>
            <p>Name: {info?.gpu[0].name}</p>
            <p>Load: {info?.gpu[0].load}</p>
            <p>Memory Total: {info?.gpu[0].memory_total}</p>
            <p>Memory Used: {info?.gpu[0].memory_used}</p>
            <p>Memory Free: {info?.gpu[0].memory_free}</p>
            <p>Temperature: {info?.gpu[0].temperature}</p>
          </div>
          <div className='statsbox'>
            <h2>Memory</h2>
            <p>Total: {(info?.memory.total / 1e9).toFixed(2)} GB</p>
            <p>Used: {(info?.memory.used / 1e9).toFixed(2)} GB</p>
            <p>Free: {(info?.memory.free / 1e9).toFixed(2)} GB</p>
            <p>Usage: {info?.memory.percent}%</p>
          </div>
          <div className='statsbox' id="osinfodash">
          <h1>OS</h1>
            <p>{`${info?.os.system} ${info?.os.release} (Version: ${info?.os.version}) - ${info?.os.processor}`}</p>
          
          </div>
          <div className='statsbox'>
          <h2>Disk</h2>
            <p>Total: {(info?.disk.usage[0].total / 1e12).toFixed(2)} TB</p>
            <p>Used: {(info?.disk.usage[0].used / 1e12).toFixed(2)} TB</p>
            <p>Free: {(info?.disk.usage[0].free / 1e12).toFixed(2)} TB</p>
            <p>Usage: {info?.disk.usage[0].percent}%</p>
          </div>


        </div>
      </div>
    </div>
  );
};
