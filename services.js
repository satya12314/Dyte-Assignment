import chalk from "chalk";
import { Logs } from "./models/models.log.js";
const CHUNK_SIZE = 100;
const InjectData = async (data) => {
  try {
    const promises = [];

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      promises.push(Logs.insertMany(chunk));
    }

    await Promise.all(promises);
  } catch (error) {
    console.log(chalk.red("Error [data service injection :]"), error);
    throw error;
  }
};
const QuerySearch = async (query, rolePermissions) => {
  try {
    let aggregateFilters = [
      {
        $match: {},
      },
      {
        $project: {
          _id: 1,
        },
      },
    ];

    rolePermissions.forEach((key) => {
      aggregateFilters[1].$project[key] = 1;
    });

    if (query?.level && query?.level.length > 0) {
      aggregateFilters[0].$match.level = {
        $in: query.level,
      };
    }

    if (query?.message && query?.message.length > 0) {
      aggregateFilters[0].$match.message = {
        $regex: query.message,
      };
    }

    if (query?.resourceId && query?.resourceId.length > 0) {
      aggregateFilters[0].$match.resourceId = query.resourceId;
    }

    if (query?.spanId && query?.spanId.length > 0) {
      aggregateFilters[0].$match.spanId = query.spanId;
    }

    if (query?.traceId && query?.traceId.length > 0) {
      aggregateFilters[0].$match.traceId = query.traceId;
    }

    if (query?.commit && query?.commit.length > 0) {
      aggregateFilters[0].$match.commit = query.commit;
    }

    if (query["metadata.parentResourceId"] && query["metadata.parentResourceId"].length > 0) {
      aggregateFilters[0].$match["metadata.parentResourceId"] = query["metadata.parentResourceId"];
    }

    if (query?.timestamp_st && query?.timestamp_end) {
      aggregateFilters[0].$match.timestamp = {
        $gte: query.timestamp_st,
        $lte: query.timestamp_end,
      };
    }

    const res = await Logs.aggregate(aggregateFilters);

    return res;
  } catch (error) {
    console.log(chalk.red("Error [Service for Query Search :]"), error);
    throw error;
  }
};

export { InjectData, QuerySearch };
