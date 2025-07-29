const { DiagnosticTest } = require('../models');

exports.list = async (req, res) => {
  const tests = await DiagnosticTest.findAll();
  res.json(tests);
};

exports.create = async (req, res) => {
  const test = await DiagnosticTest.create(req.body);
  res.json(test);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  await DiagnosticTest.update(req.body, { where: { id } });
  const test = await DiagnosticTest.findByPk(id);
  res.json(test);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  await DiagnosticTest.destroy({ where: { id } });
  res.sendStatus(204);
};
