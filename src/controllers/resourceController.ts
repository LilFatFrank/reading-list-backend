import { Request, Response } from "express";
import config from "../config";
import axios from "axios";
import Resource from "../schema/resourceSchema";
import { Types } from "mongoose";

export const addResource = async (req: Request, res: Response) => {
  try {

    const preview = await axios.get(
      `https://jsonlink.io/api/extract?url=${req.body.url}&api_key=${config.metadataApiKey}`
    );
    const { title, images, description, url } = preview.data;

    const resource = new Resource({
      title,
      image: images[0],
      description,
      url,
      type: req.body.type,
      category: req.body.category,
      upVotes: 0,
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getResources = async (req: Request, res: Response) => {
  const limit = req.body.limit || 10;
  const startAfterId = req.body.startAfterId || null;
  const types = req.body.types || null;
  const categories = req.body.categories || null;
  const searchTitle = req.body.searchTitle || null;

  try {
    const { items, nextPageCursor, hasNextPage } = await getPaginatedItems(
      limit,
      startAfterId,
      types,
      categories,
      searchTitle
    );
    res.json({ items, nextPageCursor, hasNextPage });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
};

async function getPaginatedItems(
  limit: number,
  startAfterId: string | null,
  types: string[] | null,
  categories: string[] | null,
  searchTitle: string | null
) {
  let query: any = {};

  if (types && types.length > 0) {
    query.type = { $in: types };
  }

  if (searchTitle) {
    query.title = { $regex: new RegExp(searchTitle, "i") };
  }

  if (categories && categories.length > 0) {
    query.category = { $in: categories };
  }

  let queryOptions = { limit: limit, sort: { createdAt: -1 } };

  if (startAfterId) {
    const startAfter = await Resource.findById(startAfterId);
    if (startAfter && startAfter.createdAt) {
      query.createdAt = { $lt: startAfter.createdAt };
    }
  }

  const items = await Resource.find(query, null, queryOptions);

  // Determine if there's a next page
  let hasNextPage = items.length === limit;

  // ID to start after for the next page
  const nextPageCursor = hasNextPage ? items[items.length - 1]._id.toString() : null;

  return { items, nextPageCursor, hasNextPage };
}

export const addPoint = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.body;

    if (!Types.ObjectId.isValid(itemId)) {
      return res.status(400).send("Invalid ObjectId");
    }

    const item = await Resource.findByIdAndUpdate(
      itemId,
      { $inc: { upVotes: 1 } },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).send("Item not found");
    }

    res.json({ upVotes: item.upVotes });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
};
