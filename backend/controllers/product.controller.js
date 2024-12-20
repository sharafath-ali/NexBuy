import { redis } from '../lib/redis.js';
import Product from '../models/product.model.js'
import cloudinary from '../lib/cloudinary.js'


export const getallproducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ products })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getfeaturedproducts = async (req, res) => {
  try {
    let featured = await redis.get('featured_products');
    if (featured) {
      return res.status(200).json({ products: JSON.parse(featured) })
    }
    else {
      const featuredProducts = await Product.find({ isFeatured: true }).lean();
      if (!featuredProducts) {
        return res.status(404).json({ message: 'No featured products found' })
      }
      console.log(featuredProducts)
      redis.set('featured_products', JSON.stringify(featuredProducts));
      res.status(200).json({ products: featuredProducts })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createproduct = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;

    if (!name || !description || !price || !category || !image) {
      return res.status(400).json({ message: 'Product data is required' });
    }
    let cloudinaryResponse = null;

    if (image) {
      try {
        cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
      }
      catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: error.message })
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : ""
    });
    res.status(201).json({ product })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteproduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        console.log(error)
      }
    }
    await Product.findByIdAndDelete(id);
    res.status(200).json({ product })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          price: 1,
          image: 1,
        }
      }
    ])
    res.status(200).json({ products })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getproductsbycategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    res.status(200).json({ products })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const toggleFeaturedproduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();
    await updatefeaturedproductcache()

    res.status(200).json({ product })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function updatefeaturedproductcache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set('featured_products', JSON.stringify(featuredProducts));
  } catch (error) {
    console.log(error)
  }
}
