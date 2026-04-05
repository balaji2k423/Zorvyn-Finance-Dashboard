from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from users.models import User


class AuthTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin', email='admin@test.com',
            password='admin123', role='admin'
        )
        self.viewer = User.objects.create_user(
            username='viewer', email='viewer@test.com',
            password='viewer123', role='viewer'
        )

    def get_token(self, email, password):
        res = self.client.post('/api/auth/login/', {
            'email': email, 'password': password
        })
        return res.data['tokens']['access']

    def test_login_success(self):
        res = self.client.post('/api/auth/login/', {
            'email': 'admin@test.com',
            'password': 'admin123'
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', res.data)

    def test_login_wrong_password(self):
        res = self.client.post('/api/auth/login/', {
            'email': 'admin@test.com',
            'password': 'wrongpass'
        })
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_viewer_cannot_create_record(self):
        token = self.get_token('viewer@test.com', 'viewer123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.post('/api/records/', {
            'amount': '100', 'type': 'income',
            'date': '2024-01-01'
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_record(self):
        from records.models import Category
        cat = Category.objects.create(name='Test')
        token = self.get_token('admin@test.com', 'admin123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.post('/api/records/', {
            'amount': '500',
            'type': 'income',
            'category': cat.id,
            'date': '2024-01-01',
            'notes': 'Test record'
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_viewer_cannot_manage_users(self):
        token = self.get_token('viewer@test.com', 'viewer123')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get('/api/users/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_blocked(self):
        res = self.client.get('/api/records/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)