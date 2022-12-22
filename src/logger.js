import inquirer from "inquirer";

export const askQuestions = () => {
  const questions = [
    {
      type: "input",
      name: "path",
      message: "Your starting path? (eg ./app/containers/health-pay)",
    },
  ];

  return inquirer.prompt(questions);
};
