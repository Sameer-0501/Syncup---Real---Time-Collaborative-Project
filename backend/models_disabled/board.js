module.exports = (sequelize, DataTypes) => {
  const Board = sequelize.define("Board", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Board.associate = (models) => {
    Board.hasMany(models.List, { foreignKey: "boardId", onDelete: "CASCADE" });
  };

  return Board;
};
