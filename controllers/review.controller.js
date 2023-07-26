import createError from "http-errors";
import Review from "../models/review.model.js";
import Gig from "../Models/gig.model.js";
// create review
export const createReview = async (req, res, next) => {
  if(req.isSeller) next(createError(403, "Seller can not create review"));
  
  const newreview = new Review({
    userId:req.userId,
    gigId:req.body.gigId,
    desc:req.body.desc,
    star:req.body.star
  });
  try {
   const review=await Review.findOne({
    gigId:req.body.gigId,
    userId:req.userId
   })
   if (review)
   return next(
     createError(403, "You have already created a review for this gig!")
   );

   const savedReview=await newreview.save();

   await Gig.findByIdAndUpdate(req.body.gigId, {
    $inc: { totalStars: req.body.star, starNumber: 1 },
  });
   res.status(201).send(savedReview)
  } catch (error) {
    next(error);
  }
};

// get reviewss
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({gigId:req.params.gigId});
    res.status(201).send(reviews);
  } catch (error) {
    next(error);
  }
};

// delete review
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(
      req.params.id
    );
    if (!review) next(createError(404, "Review not found"));

    if(review.userId.toString()!==req.userId) next(createError(403, "You can delete only your review"));
    review.deleteOne()
    review.save();
    res.status(200).json({ review });
  } catch (error) {
    next(error);
  }
};
