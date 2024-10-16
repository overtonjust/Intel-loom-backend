const crypto = require("crypto");
const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");
const pathToFfmpeg = require("ffmpeg-static");
ffmpeg.setFfmpegPath(pathToFfmpeg);
const { s3 } = require("../db/s3Config.js");
const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require("dotenv").config();

const generateKey = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

const modifyBuffer = async (buffer) =>
  await sharp(buffer)
    .rotate()
    .resize({
      width: 500,
      height: 500,
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toBuffer();

const modifyVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .format("mp4")
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
};

const getSignedUrlFromS3 = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    throw new Error(`Error getting signed URL from S3: ${error}`);
  }
};

const addToS3 = async (media) => {
  try {
    if (media.mimetype.includes("image")) {
      const key = generateKey();
      const modifiedBuffer = await modifyBuffer(media.buffer);
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: modifiedBuffer,
        ContentType: media.mimetype,
      });
      await s3.send(uploadCommand);
      return key;
    } else if (media.mimetype.includes("video")) {
      const key = `${generateKey()}.mp4`;
      const inputPath = `/tmp/${generateKey()}.${media.mimetype.split("/")[1]}`;
      const outputPath = `/tmp/${key}`;
      await fs.promises.writeFile(inputPath, media.buffer);
      await modifyVideo(inputPath, outputPath);
      const modifiedBuffer = await fs.promises.readFile(outputPath);
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: modifiedBuffer,
        ContentType: "video/mp4",
      });
      await s3.send(uploadCommand);
      await fs.promises.unlink(inputPath);
      await fs.promises.unlink(outputPath);
      return key;
    }
  } catch (error) {
    throw new Error(`Error uploading to S3: ${error}`);
  }
};

module.exports = { addToS3, getSignedUrlFromS3 };
