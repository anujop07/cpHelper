export const updateHandles = async (req, res) => {
  try {
    const {
      codeforcesHandle,
      leetcodeHandle,
      codechefHandle,
      gfgHandle
    } = req.body;

    const user = req.user;

    if (codeforcesHandle !== undefined)
      user.codeforcesHandle = codeforcesHandle;

    if (leetcodeHandle !== undefined)
      user.leetcodeHandle = leetcodeHandle;

    if (codechefHandle !== undefined)
      user.codechefHandle = codechefHandle;

    if (gfgHandle !== undefined)
      user.gfgHandle = gfgHandle;

    await user.save();

    res.status(200).json({
      success: true,
      message: "CP handles updated successfully",
      handles: {
        codeforcesHandle: user.codeforcesHandle,
        leetcodeHandle: user.leetcodeHandle,
        codechefHandle: user.codechefHandle,
        gfgHandle: user.gfgHandle
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
