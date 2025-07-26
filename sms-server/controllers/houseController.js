const HouseService = require('../services/houseService');

exports.getAllHouses = async (req, res) => {
  try {
    const houses = await HouseService.getAllHouses();
    res.json(houses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createHouse = async (req, res) => {
  try {
    const house = await HouseService.createHouse(req.body);
    res.status(201).json(house);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};