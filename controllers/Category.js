const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
    try {
      // fetch data
      const { name, description } = req.body;
      // validation
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      // create entry in DB
      const CategoryDetails = await Category.create({
        name: name,
        description: description,
      });
      console.log(CategoryDetails);

      // return response
      return res.status(200).json({
        success: true,
        message: "Category Created Successfully",
      });
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

exports.showAllCategory = async (req, res) => {
    try{
        const allCategory = await Category.find({}, {name: true, description: true});
        res.status(200).json({
            success: true,
            message: "All Category returned successfully",
            allCategory,
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

//  category Page Details
exports.categoryPageDetails = async (req, res) => {
  try{
    // get category Id
    const {categoryId} = req.body;

    // get courses for specified categoryId
    const selectedCategory = await Category.findById(categoryId)
                                                      .populate("courses")
                                                      .exec();

    // validation
    if(!selectedCategory){
      return res.status(200).json({
        success: false,
        message: 'data Not Found',
      });
    }

    // get Courses for different Categories
    const differentCategories = await Category.find({
      _id: {$ne: categoryId},
    })
    .populate("courses")
    .exec();

    // return response
    return res.status(200).json({
      success: true,
      message: "fetched Category page details",
      data: {
        selectedCategory,
        differentCategories,
      },
    });
  }catch(error){
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "error occured while fetching category page details",
    })
  }
};