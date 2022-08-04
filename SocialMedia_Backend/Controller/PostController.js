import PostModel from "../Models/PostModel.js";
import mongoose from "mongoose";
import UserModel from "../Models/UserModel.js";

export const createPost = async(req,res)=>{
    const newPost = new PostModel(req.body)
    try{
        await newPost.save()
        res.status(200).json(newPost)
    } catch(e){
        res.status(400).json("Error creating post")
    }
}

//get post

export const getPost = async(req,res)=>{
    const id = req.params.id
    try{
        const post = await PostModel.findById(id)
        res.status(200).json(post)
    }catch(e){
        res.status(500).json("error")
    }
    res.status(200).json(post)
}

//update post

export const updatePost = async(req,res)=>{
    const postId = req.params.id
    const {userId} = req.body

    try{
        const post = await PostModel.findById(postId)
        if(post.userId === userId){
            await post.updateOne({$set: req.body})
            res.status(200).json("Post updated")
        } else{
            res.status(403).json("Action forbidden!")
        }
    } catch(e){
        res.status(500).json("Error updating post")
    }
}

//delete post

export const deletePost = async(req,res)=>{
    const id = req.params.id

    const {userId} = req.body
    try{
        const post = await PostModel.findById(id)
        if(post.userId === userId){
            await post.deleteOne()
            res.status(200).json("Post deleted successfully")
        } else{
            res.status(500).json("Action forbidden!")
        }
    } catch(e){
        res.status(500).json("Error")
    }
}

//like/dislike

export const likePost = async(req,res)=>{
    const id = req.params.id
    const {userId} = req.body
    try{
        const post = await PostModel.findById(id)
        if(!post.likes.includes(userId)){
            await post.updateOne({$push:{likes:userId}})
            res.status(200).json("Post liked")
        } else{
            await post.updateOne({$pull:{likes:userId}})
            res.status(200).json("Post unliked")
        }
    } catch(e){
        res.status(500).json("Error")
    }
}

//get Timelineposts

export const getTimelinePOst = async(req,res)=>{
    const userId = req.params.id
    try {
        const currentUserPosts = await PostModel.find({userId: userId})
        const followingPost = await UserModel.aggregate([
            {
                $match:{
                    _id : new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup : {
                    from : "posts",
                    localField: "following",
                    foreignField: "userId",
                    as:"followingPosts"
                }
            },
            {
                $project:{
                    followingPost : 1,
                    _id : 0
                }
            }
        ])
        res.status(200).json(currentUserPosts.concat(...followingPost)
        .sort((a,b)=>{
            return b.createdAt - a.createdAt;
        })
        );
    } catch (error) {
        res.status(500).json("Error to get timeline posts")
    }
}