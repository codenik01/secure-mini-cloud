const Docker = require('dockerode');
const Log = require('../models/logModel');
// Connect to docker daemon using the local socket
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' });

exports.listContainers = async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    // Filter out our own infrastructure containers so users only see their spawned ones
    const userContainers = containers.filter(c => c.Names[0].startsWith('/smc_instance_'));
    res.json(userContainers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch containers.' });
  }
};

exports.createContainer = async (req, res) => {
  try {
    const { imageType, name } = req.body;
    let imageName = 'nginx:alpine';
    let exposedPort = 80;

    if (imageType === 'node') {
      imageName = 'node:alpine';
      exposedPort = 3000;
    } else if (imageType === 'python') {
      imageName = 'python:alpine';
      exposedPort = 8000;
    }

    const containerName = `smc_instance_${req.user.username}_${name || Date.now()}`;

    // Pull the image if not present (simplified for this example, ideally this shouldn't block)
    // For synchronous response we assume the images are simple
    
    const container = await docker.createContainer({
      Image: imageName,
      name: containerName,
      Cmd: imageType === 'node' ? ['node', '-e', 'setInterval(()=>{},1000)'] : 
           imageType === 'python' ? ['python', '-c', 'import time; time.sleep(100000)'] : 
           ['nginx', '-g', 'daemon off;'],
      HostConfig: {
        PortBindings: {
          [`${exposedPort}/tcp`]: [{ HostPort: '0' }] // Bind to a random available port
        }
      }
    });

    await container.start();
    
    // Log
    await Log.create({ user: req.user.username, action: 'container_created', ip: req.ip, details: { containerName, imageType } });

    res.status(201).json({ message: 'Container started rapidly.', containerId: container.id, name: containerName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create container.' });
  }
};

exports.stopContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    await container.stop();
    await Log.create({ user: req.user.username, action: 'container_stopped', ip: req.ip, details: { containerId: id } });
    res.json({ message: 'Container stopped.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop container.' });
  }
};

exports.deleteContainer = async (req, res) => {
  try {
    const { id } = req.params;
    const container = docker.getContainer(id);
    await container.remove({ force: true });
    await Log.create({ user: req.user.username, action: 'container_deleted', ip: req.ip, details: { containerId: id } });
    res.json({ message: 'Container deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete container.' });
  }
};
