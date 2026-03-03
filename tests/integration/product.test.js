const request = require('supertest');
const app = require('../../backend/app');
const mongoose = require('mongoose');
const User = require('../../backend/models/userModel');
const Brand = require('../../backend/models/brandModel');
const Category = require('../../backend/models/categoryModel');

describe('Product API Integration Tests', () => {

    let adminToken;
    let categoryId;
    let brandId;
    let productId;

    beforeEach(async () => {
        // 1. Create Admin
        const adminData = {
            name: 'Admin User',
            email: 'admin.product@example.com',
            password: 'password123',
            gender: 'male',
            mobileNumber: '9876543210',
            avatar: 'admin-avatar'
        };
        await request(app).post('/api/v1/register').send(adminData);
        await User.findOneAndUpdate({ email: adminData.email }, { role: 'admin' });

        const loginRes = await request(app)
            .post('/api/v1/login')
            .send({ login: adminData.email, password: adminData.password });
        adminToken = loginRes.body.token;

        // 2. Create Category
        const category = await Category.create({
            name: 'Electronics',
            description: 'Electronic items',
            image: { public_id: 'cat_img', url: 'cat_url' }
        });
        categoryId = category._id;

        // 3. Create Brand
        const brand = await Brand.create({
            name: 'Samsung',
            description: 'Samsung brand',
            logo: { public_id: 'brand_img', url: 'brand_url' }
        });
        brandId = brand._id;
    });

    it('1. Should fail to create a product if image is missing', async () => {
        const res = await request(app)
            .post('/api/v1/admin/product/new')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'Test Product',
                price: 1000,
                cuttedPrice: 1200,
                description: 'Test description',
                category: categoryId,
                brand: brandId,
                stock: 10,
                highlights: ["High quality"],
                specifications: [{ title: "Model", description: "2024" }]
            });

        expect(res.statusCode).not.toEqual(201);
        expect(res.body.success).toBe(false);
    });

    it('2. Should fail to create a product with invalid category ID', async () => {
        const res = await request(app)
            .post('/api/v1/admin/product/new')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'Test Product',
                price: 1000,
                cuttedPrice: 1200,
                description: 'Test description',
                category: '64b0f1a2e4b0f1a2e4b0f1a2', // Non-existent but valid format
                brand: brandId,
                stock: 10,
                images: ["image1.jpg"],
                highlights: ["High quality"],
                specifications: [{ title: "Model", description: "2024" }]
            });

        expect(res.statusCode).not.toEqual(201);
    });

    it('3. Should create a valid product', async () => {
        const res = await request(app)
            .post('/api/v1/admin/product/new')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'Valid Product',
                price: 1000,
                cuttedPrice: 1500,
                description: 'Valid description',
                category: categoryId,
                brand: brandId,
                stock: 10,
                images: ["image-data-url-or-string"], // Mocked in cloudinary
                highlights: ["Highlight 1"],
                specifications: [{ title: "Spec 1", description: "Desc 1" }]
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        productId = res.body.product._id;
    });

    it('4. Should update a product', async () => {
        // Setup a product first
        const product = await request(app)
            .post('/api/v1/admin/product/new')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'Product to Update',
                price: 1000,
                cuttedPrice: 1500,
                description: 'Desc',
                category: categoryId,
                brand: brandId,
                stock: 10,
                images: ["img"],
                highlights: ["H"],
                specifications: [{ title: "T", description: "D" }]
            });

        const pid = product.body.product._id;

        const res = await request(app)
            .put(`/api/v1/admin/product/${pid}`)
            .set('Cookie', [`token=${adminToken}`])
            .send({ price: 2000 });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.product.price).toBe(2000);
    });

    it('5. Should delete a product', async () => {
        // Setup a product first
        const product = await request(app)
            .post('/api/v1/admin/product/new')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'Product to Delete',
                price: 1000,
                cuttedPrice: 1500,
                description: 'Desc',
                category: categoryId,
                brand: brandId,
                stock: 10,
                images: ["img"],
                highlights: ["H"],
                specifications: [{ title: "T", description: "D" }]
            });

        const pid = product.body.product._id;

        const res = await request(app)
            .delete(`/api/v1/admin/product/${pid}`)
            .set('Cookie', [`token=${adminToken}`]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

});
