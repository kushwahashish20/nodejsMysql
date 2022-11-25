const {LookupValueUtil} = require('../../../src/util/lookup-value-util');

it("should get the rule label", async () => {
  let ruleId = "multipack_off_model";
  let ruleLabel = LookupValueUtil.getRuleLabel(ruleId);
  console.log(ruleLabel);
});

it("should get the rule description", async () => {
  let ruleId = "multipack_off_model";
  let ruleDesc = LookupValueUtil.getRuleDescription(ruleId);
  console.log(ruleDesc);
});

it("should get the rule how to", async () => {
  let ruleId = "multipack_off_model";
  let ruleHowTo = LookupValueUtil.getRuleHowTo(ruleId);
  console.log(ruleHowTo);
});

it("should get the category label correctly", async () => {
  let categoryId = "dimensions";
  let categoryLabel = LookupValueUtil.getCategoryLabel(categoryId);
  console.log(categoryLabel);
  expect(categoryLabel).toBe("Dimensions");
});

it("should get the issue label correctly", async () => {
  let issueId = "critical_issues";
  let issueLabel = LookupValueUtil.getIssueLabel(issueId);
  console.log(issueLabel);
  expect(issueLabel).toBe("Critical Issues");
});
