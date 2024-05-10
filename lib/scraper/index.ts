import axios from "axios";
import * as cheerio from 'cheerio'
import { extractPrice, extractCurrencySymbol, extractDescription } from "../utils/extractData";

export async function scrapeAmazonProduct(url: string) {
    if (!url) return;

    const username = String(process.env.BRIGHT_DATA_USERNAME)
    const password = String(process.env.BRIGHT_DATA_PASSWORD)
    const host = String(process.env.BRIGHT_DATA_HOST)
    const port = Number(process.env.BRIGHT_DATA_PORT)
    const session_id = (1000000 * Math.random()) | 0;

    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host,
        port,
        rejectUnathorized: false
    }

    try {
        const response = await axios.get(url, options)
        const $ = cheerio.load(response.data);

        const title = $('#productTitle').text().trim()
        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('.a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
            $('.a-price.a-text-price span.a-offscreen'),
        )

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock-dealprice'),
            $('.a-size-base.a-color-price'),
        )

        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavaliable'

        const images =
            $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') ||
            '{}'
        
        const imageUrls = Object.keys(JSON.parse(images))

        const currency = extractCurrencySymbol($('.a-price.a-text-price span.a-offscreen'))
        const discountRate = $('.savingsPercentage').text().match(/\d+/)?.[0] || 0

        const description = extractDescription($)

        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: 'category',
            reviewsCount: 100,
            stars: 4.5,
            isOutOfStock: outOfStock,
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice)
        }

        return data;
    } catch (error:any) {
        throw new Error(`Failed to scrape product: ${error.message}`)
    }
}