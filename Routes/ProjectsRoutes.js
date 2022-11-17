const express = require("express");
const mongoose = require("mongoose");
const ExpenceModal = require("../Modals/ExpenceModal");
const ProjectsModal = require("../Modals/ProjectsModal");
const CustomerModal = require("../Modals/CustomerModal");
const Accounts = require("../Modals/Accounts");
const projectRouter = express.Router();
const multer = require("multer");
var path = require("path");

let gCode = "PR_000";
//Get all Projects
projectRouter.get("/all-projects", async (req, res) => {
  const allProjects = await ProjectsModal.find();
  res.send({ Projects: allProjects });
});
//Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Uploads/Files");
  },
  filename: function (req, file, cb) {
    // cb(null, "PR_001" + "-" + file.originalname);
    return cb(null, `PR_000_${Date.now()}${path.extname(file.originalname)}`);
  },
});
//Upload
const upload = multer({ storage: storage });
//File Upload
projectRouter.post("/file-upload/:code", upload.single("file"), (req, res) => {
  const code = req.params.code;
  console.log("Code is: ", code);
  gCode = code;
  if (!req.file) {
    res.send({
      success: false,
      error: "File Can not be added",
    });
  }
  res.send({
    success: true,
    message: "File Saved Successfully",
    file_url: `https://zippylink-server.herokuapp.com/file/${req.file.filename}`,
  });
});
//Add new Project
projectRouter.post("/add-project", async (req, res) => {
  try {
    const {
      Project_Code,
      Date,
      Deadline,
      Customer,
      Project_Title,
      Project_Nature,
      Product,
      Supplier,
      Status,
      Budget,
      Currency,
      Cost,
      Description,
      Account_Email,
      Name,
      Email,
      File,
      Exchange_Rate,
    } = req.body;
    console.log("Body: ", req.body);
    const alreadyExist = await ProjectsModal.findOne({ Project_Code });
    if (alreadyExist) {
      res.send({ error: "Project with this code already exists." });
      return;
    }
    const newProject = await ProjectsModal({
      Project_Code,
      Date,
      Deadline,
      Customer,
      Project_Title,
      Project_Nature,
      Product,
      Supplier,
      Status,
      Budget,
      Currency: Currency ? Currency : "AFN",
      Cost,
      Description,
      File,
      Exchange_Rate,
    });
    if (!newProject) return res.send({ error: "Project Cannot be Added" });
    await newProject.save();
    res.send({
      message: "Project added successfully!!!",
      New_Project: newProject,
    });
    try {
      await Accounts.findOneAndUpdate({ Account_Email }, {}).then(
        async (account) => {
          // account.Total_Debit = account.Total_Debit + Cost;
          account.Credit.push({
            CreditBy: {
              Name,
              Email,
            },
            Source: {
              Project_Name: Project_Title,
              Project_Code,
            },
            ReceiveAs: `Value of ${Project_Title}`,
            Ammount: Budget,
            Date,
            Currency,
          });
          if (Currency == "USD") {
            account.USD_Credit.push({
              CreditBy: {
                Name,
                Email,
              },
              Source: {
                Project_Name: Project_Title,
                Project_Code,
              },
              ReceiveAs: `Value of ${Project_Title}`,
              Ammount: Budget,
              Date,
              Entry_Currency: Currency,
              Value_Currency: Currency,
              Exchange_Rate,
            });
            account.USD_Total_Credit = account.USD_Total_Credit + Budget;
            account.USD_Cash_Inhand =
              account.USD_Total_Credit - account.USD_Total_Debit;

            account.AFN_Credit.push({
              CreditBy: {
                Name,
                Email,
              },
              Source: {
                Project_Name: Project_Title,
                Project_Code,
              },
              ReceiveAs: `Value of ${Project_Title}`,
              Ammount: Budget * Exchange_Rate,
              Date,
              Entry_Currency: Currency,
              Value_Currency: "AFN",
              Exchange_Rate,
            });
            account.AFN_Total_Credit =
              account.AFN_Total_Credit + Budget * Exchange_Rate;
            account.AFN_Cash_Inhand =
              account.AFN_Total_Credit - account.AFN_Total_Debit;
          } else if (Currency == "AFN") {
            account.AFN_Credit.push({
              CreditBy: {
                Name,
                Email,
              },
              Source: {
                Project_Name: Project_Title,
                Project_Code,
              },
              ReceiveAs: `Value of ${Project_Title}`,
              Ammount: Budget,
              Date,
              Entry_Currency: Currency,
              Value_Currency: Currency,
              Exchange_Rate,
            });
            account.AFN_Total_Credit = account.AFN_Total_Credit + Budget;
            account.AFN_Cash_Inhand =
              account.AFN_Total_Credit - account.AFN_Total_Debit;
            account.USD_Credit.push({
              CreditBy: {
                Name,
                Email,
              },
              Source: {
                Project_Name: Project_Title,
                Project_Code,
              },
              ReceiveAs: `Value of ${Project_Title}`,
              Ammount: Budget / Exchange_Rate,
              Date,
              Entry_Currency: Currency,
              Value_Currency: "USD",
              Exchange_Rate,
            });
            account.USD_Total_Credit =
              account.USD_Total_Credit + Budget / Exchange_Rate;
            account.USD_Cash_Inhand =
              account.USD_Total_Credit - account.USD_Total_Debit;
          }

          // account.Total_Credit = account.Total_Credit + Budget;
          // account.Cash_Inhand = account.Total_Credit - account.Total_Debit;
          await account.save();
          try {
            await CustomerModal.findOneAndUpdate({ Name: Customer }, {}).then(
              async (customer) => {
                customer.Projects.push({
                  Project_Code,
                  Date,
                  Project_Title,
                  Project_Nature,
                  Budget,
                  Cost,
                });
                await customer.save();
                console.log("Customer: ", customer);
              }
            );
          } catch (error) {
            console.log(error);
          }
          return res.send({
            message: "Account Credited Successfully!",
          });
        }
      );
    } catch (error) {
      return res.send({ error: "Account cannot be Credited!" });
    }
  } catch (error) {
    // res.send({ error: "Project Cannot be Added" });
  }
});

//Add Project Cost
projectRouter.post("/add-project-cost", async (req, res) => {
  const {
    projectCode,
    Cost_Title,
    Cost_Type,
    Ammount,
    CreatedAt,
    Account_Email,
    Name,
    Email,
    Voucher_Number,
    Currency,
    Exchange_Rate,
    Cost_Currency,
  } = req.body;
  console.log(req.body);
  try {
    await ProjectsModal.findOneAndUpdate(
      { Project_Code: projectCode },
      {}
    ).then(async (project) => {
      project.Project_Cost.push({
        Cost_Title,
        Cost_Type,
        Ammount,
        CreatedAt,
        Voucher_Number,
        Cost_Currency,
        Exchange_Rate,
      });
      await project.save();

      res.send({
        message: "Project Cost Added Successfully!",
        projectCost: project.Project_Cost,
      });

      project.Cost =
        project.Cost +
        (project.Currency == "USD" && Cost_Currency == "USD"
          ? Ammount
          : project.Currency == "USD" && Cost_Currency == "AFN"
          ? Ammount / Exchange_Rate
          : project.Currency == "AFN" && Cost_Currency == "USD"
          ? Ammount * Exchange_Rate
          : Ammount);
      project.Alternate_Cost =
        project.Alternate_Cost +
        (Cost_Currency === "AFN"
          ? Ammount / Exchange_Rate
          : Ammount * Exchange_Rate);
      console.log();
      await project.save();
      try {
        await Accounts.findOneAndUpdate({ Account_Email }, {}).then(
          async (account) => {
            if (!account) return res.send({ error: "Account does not exist" });
            //delete from
            account.Debit.push({
              Person: {
                Name,
                Email,
              },
              ReceiveAs: `${Cost_Type} Expence`,
              Ammount,
              Voucher_Number,
              Currency,
            }); //delete to
            if (Cost_Currency === "USD") {
              account.USD_Debit.push({
                Person: {
                  Name,
                  Email,
                },
                ReceiveAs: `${Cost_Type} Expence`,
                Ammount,
                Voucher_Number,
                Exchange_Rate,
                Entry_Currency: Cost_Currency,
                Value_Currency: Cost_Currency,
              });
              account.USD_Total_Debit = account.USD_Total_Debit + Ammount;
              account.USD_Cash_Inhand =
                account.USD_Total_Credit - account.USD_Total_Debit;
              account.AFN_Debit.push({
                Person: {
                  Name,
                  Email,
                },
                ReceiveAs: `${Cost_Type} Expence`,
                Ammount: Ammount * Exchange_Rate,
                Voucher_Number,
                Entry_Currency: Cost_Currency,
                Value_Currency: "AFN",
                Exchange_Rate,
              });
              account.AFN_Total_Debit =
                account.AFN_Total_Debit + Ammount * Exchange_Rate;
              account.AFN_Cash_Inhand =
                account.AFN_Total_Credit - account.AFN_Total_Debit;
            } else if (Cost_Currency === "AFN") {
              account.AFN_Debit.push({
                Person: {
                  Name,
                  Email,
                },
                ReceiveAs: `${Cost_Type} Expence`,
                Ammount,
                Voucher_Number,
                Entry_Currency: Cost_Currency,
                Value_Currency: Cost_Currency,
                Exchange_Rate,
              });
              account.AFN_Total_Debit = account.AFN_Total_Debit + Ammount;
              account.AFN_Cash_Inhand =
                account.AFN_Total_Credit - account.AFN_Total_Debit;

              account.USD_Debit.push({
                Person: {
                  Name,
                  Email,
                },
                ReceiveAs: `${Cost_Type} Expence`,
                Ammount: Ammount / Exchange_Rate,
                Voucher_Number,
                Entry_Currency: Cost_Currency,
                Value_Currency: "USD",
                Exchange_Rate,
              });
              account.USD_Total_Debit =
                account.USD_Total_Debit + Ammount / Exchange_Rate;
              account.USD_Cash_Inhand =
                account.USD_Total_Credit - account.USD_Total_Debit;
            }
            //delete from
            // account.Total_Debit = account.Total_Debit + Ammount;
            // account.Cash_Inhand = account.Total_Credit - account.Total_Debit;
            //delete to
            await account.save();
            return res.send({ message: "Account Debited Successfully!" });
          }
        );
      } catch (error) {
        res.send({ error: "Account Not debited" });
      }
    });
  } catch (error) {
    console.log({
      error: "Project Cost Cannot be added! Please Check the Network",
    });
  }
});

//SIngle Project
projectRouter.post("/single-Project", async (req, res) => {
  const { Project_Code } = req.body;
  console.log(Project_Code);
  const project = await ProjectsModal.findOne({ Project_Code });
  res.send({ project });
});

//Update Project
projectRouter.post("/update-project", async (req, res) => {
  try {
    let {
      Project_Code,
      Currency,
      Date,
      Customer,
      Project_Title,
      Project_Nature,
      Product,
      Supplier,
      Status,
      Budget,
      Cost,
      Description,
      Exchange_Rate,
    } = req.body;
    Exchange_Rate = Exchange_Rate ? Exchange_Rate : 88.2;
    console.log("BODY: ", req.body);
    await ProjectsModal.findOneAndUpdate(
      { Project_Code },
      {
        Project_Code,
        Date,
        Customer,
        Project_Title,
        Project_Nature,
        Product,
        Supplier,
        Status,
        Budget,
        Cost,
        BRT: Budget * 0.02,
        NetAmmount: Budget - Budget * 0.02,
        Revenue: Budget - Budget * 0.02 - Cost,
        Alternate_Cost:
          Currency === "AFN" ? Cost / Exchange_Rate : Cost * Exchange_Rate,
        Alternate_NetAmmount:
          Currency === "AFN"
            ? (Budget - Budget * 0.02) / Exchange_Rate
            : (Budget - Budget * 0.02) * Exchange_Rate,
        Alternate_Budget:
          Currency === "AFN" ? Budget / Exchange_Rate : Budget * Exchange_Rate,
        Alternate_BRT:
          (Currency === "AFN"
            ? Budget / Exchange_Rate
            : Budget * Exchange_Rate) * 0.02,
        Alternate_Currency: Currency === "AFN" ? "USD" : "AFN",
        Alternate_Revenue:
          (Currency === "AFN"
            ? (Budget - Budget * 0.02) / Exchange_Rate
            : (Budget - Budget * 0.02) * Exchange_Rate) -
          (Currency === "AFN" ? Cost / Exchange_Rate : Cost * Exchange_Rate),
        Description,
      }
    ).then(async (updated) => {
      await updated.save();
      res.send({
        message: "Project Updated Successfully!!!",
        project: updated,
      });
    });
  } catch (error) {
    console.log("Error: ", error);
    res.send({ error });
  }
});

//Add Project Budget
projectRouter.post("/add-project-budget", async (req, res) => {
  const {
    projectCode,
    Ammount,
    CreatedAt,
    Account_Email,
    Name,
    Email,
    Currency,
    Exchange_Rate,
    Client_Name,
    Client_Email,
  } = req.body;
  console.log("Body: ", req.body);
  try {
    await ProjectsModal.findOneAndUpdate(
      { Project_Code: projectCode },
      {}
    ).then(async (project) => {
      project.Project_Budget.push({
        Ammount,
        CreatedAt,
        Exchange_Rate,
        ReceivedBy: {
          Name,
          Email,
        },
        SubmittedBy: {
          Client_Name,
          Client_Email,
        },
        Description: `Installment # ${project.Project_Budget.length + 1}`,
      });
      await project.save();
      res.send({
        message: "Project Budget Added Successfully!",
        projectCost: project.Project_Budget,
      });
      console.log("Budget Before: ", project.Budget);

      project.Budget = project.Budget + Ammount;
      const brt = Ammount * 0.02;
      const alt_brt =
        Currency === "AFN" ? brt / Exchange_Rate : brt * Exchange_Rate;

      const Alt_Budget =
        Currency === "AFN" ? Ammount / Exchange_Rate : Ammount * Exchange_Rate;
      const netAmmount = Ammount - brt;
      //Alternate_Budget
      project.Alternate_Budget = project.Alternate_Budget + Alt_Budget;
      //BRT
      project.BRT = project.BRT + brt;
      //Alternate_BRT
      project.Alternate_BRT = project.Alternate_BRT + alt_brt;
      //NetAmmount
      project.NetAmmount = project.Budget - project.BRT;
      const alt_NetAmmount =
        Currency === "AFN"
          ? netAmmount / Exchange_Rate
          : netAmmount * Exchange_Rate;
      //Alternate_NetAmmount
      project.Alternate_NetAmmount =
        project.Alternate_NetAmmount + alt_NetAmmount;
      project.Revenue = project.Budget - project.Cost;
      project.Alternate_Revenue =
        project.Alternate_NetAmmount - project.Alternate_Cost;

      await project.save();
      try {
        await Accounts.findOneAndUpdate(
          { Account_Email, Currency: project.Currency },
          {}
        ).then(async (account) => {
          account.Credit.push({
            CreditBy: {
              Name,
              Email,
            },
            Source: {
              Project_Name: project.Project_Title,
              Project_Code: project.Project_Code,
            },
            ReceiveAs: `Value of ${project.Project_Title} Installment # ${project.Project_Budget.length}`,
            Ammount,
            Currency,
          });

          account.Total_Credit = account.Total_Credit + Ammount;
          account.Cash_Inhand = account.Total_Credit - account.Total_Debit;
          await account.save();
        });
      } catch (error) {
        return res.send({ error: "Account cannot be Credited!" });
      }
    });
  } catch (error) {
    console.log("Error: ", error);
  }
});

module.exports = projectRouter;
