import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Infinity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const plans = [
	{
		name: 'Free',
		price: '$0',
		period: 'forever',
		description: 'Perfect for getting started',
		features: [
			'Access to public courses',
			'Basic progress tracking',
			'Community discussions',
			'Mobile app access',
		],
		current: true,
		cta: 'Current Plan',
		icon: Star,
	},
	{
		name: 'Premium',
		price: '$9.99',
		period: 'month',
		description: 'Best for serious learners',
		features: [
			'All free features',
			'Access to premium courses',
			'Advanced progress analytics',
			'Priority support',
			'Offline downloads',
			'Certificates of completion',
			'Premium course uploads',
		],
		popular: true,
		cta: 'Upgrade to Premium',
		icon: Crown,
	},
	{
		name: 'Pro',
		price: '$19.99',
		period: 'month',
		description: 'For professionals and teams',
		features: [
			'All premium features',
			'Unlimited course creation',
			'Advanced analytics dashboard',
			'Team collaboration tools',
			'White-label options',
			'API access',
			'Dedicated account manager',
		],
		cta: 'Go Pro',
		icon: Infinity,
	},
];

const premiumCourses = [
	{
		title: 'Advanced React Patterns',
		instructor: 'John Doe',
		rating: 4.9,
		image:
			'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
	},
	{
		title: 'Machine Learning Mastery',
		instructor: 'Dr. Sarah Smith',
		rating: 4.8,
		image:
			'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop',
	},
	{
		title: 'Full-Stack Development',
		instructor: 'Mike Johnson',
		rating: 4.7,
		image:
			'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
	},
];

export const Premium: React.FC = () => {
	const { user } = useAuth();

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
			<div className="container mx-auto px-4 py-12">
				{/* Header */}
				<div className="text-center mb-16">
					<h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Unlock Your Learning Potential
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
						Join thousands of learners who have accelerated their careers with our
						premium courses and advanced features.
					</p>
				</div>

				{/* Pricing Plans */}
				<div className="grid md:grid-cols-3 gap-8 mb-16">
					{plans.map((plan, index) => {
						const Icon = plan.icon;
						return (
							<Card
								key={index}
								className={`relative ${
									plan.popular
										? 'border-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20'
										: 'bg-white/80 dark:bg-gray-800/80'
								} backdrop-blur-sm transition-all duration-300 hover:shadow-xl`}
							>
								{plan.popular && (
									<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
										<Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-1">
											Most Popular
										</Badge>
									</div>
								)}

								<CardHeader className="text-center pb-4">
									<div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 w-fit">
										<Icon className="h-8 w-8 text-blue-600" />
									</div>
									<CardTitle className="text-2xl">{plan.name}</CardTitle>
									<div className="mt-4">
										<span className="text-4xl font-bold">{plan.price}</span>
										<span className="text-gray-600 dark:text-gray-400">
											/{plan.period}
										</span>
									</div>
									<CardDescription className="mt-2">
										{plan.description}
									</CardDescription>
								</CardHeader>

								<CardContent>
									<ul className="space-y-3 mb-8">
										{plan.features.map((feature, featureIndex) => (
											<li
												key={featureIndex}
												className="flex items-center gap-3"
											>
												<Check className="h-5 w-5 text-green-500 flex-shrink-0" />
												<span className="text-sm">{feature}</span>
											</li>
										))}
									</ul>

									{plan.current ? (
										<Button
											className="w-full bg-gray-300 text-gray-600 cursor-not-allowed"
											disabled
										>
											{plan.cta}
										</Button>
									) : (
										<Button
											className="w-full bg-gray-300 text-gray-600 cursor-not-allowed"
											disabled
										>
											Coming Soon
										</Button>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>

				{/* Premium Course Preview */}
				<div className="mb-16">
					<h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Premium Course Preview
					</h2>
					<div className="grid md:grid-cols-3 gap-6">
						{premiumCourses.map((course, index) => (
							<Card
								key={index}
								className="group hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0"
							>
								<div className="relative">
									<img
										src={course.image}
										alt={course.title}
										className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
									/>
									<div className="absolute top-4 left-4">
										<Badge variant="secondary">✨ Premium</Badge>
									</div>
									<div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center">
										<Button
											size="sm"
											className="bg-white/90 text-black hover:bg-white"
										>
											Preview Course
										</Button>
									</div>
								</div>
								<CardHeader>
									<CardTitle className="text-lg">{course.title}</CardTitle>
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600 dark:text-gray-400">
											{course.instructor}
										</span>
										<div className="flex items-center gap-1">
											<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
											<span className="text-sm">{course.rating}</span>
										</div>
									</div>
								</CardHeader>
							</Card>
						))}
					</div>
				</div>

				{/* Features Highlight */}
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
					<Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0">
						<Zap className="h-12 w-12 mx-auto mb-4 text-blue-600" />
						<h3 className="font-semibold mb-2">Instant Access</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Access all premium courses immediately after upgrade
						</p>
					</Card>

					<Card className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0">
						<Crown className="h-12 w-12 mx-auto mb-4 text-purple-600" />
						<h3 className="font-semibold mb-2">Premium Support</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Get priority help from our expert support team
						</p>
					</Card>

					<Card className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0">
						<Check className="h-12 w-12 mx-auto mb-4 text-green-600" />
						<h3 className="font-semibold mb-2">Certificates</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Earn verified certificates upon course completion
						</p>
					</Card>

					<Card className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-0">
						<Infinity className="h-12 w-12 mx-auto mb-4 text-orange-600" />
						<h3 className="font-semibold mb-2">Unlimited Learning</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							No limits on courses, downloads, or progress tracking
						</p>
					</Card>
				</div>

				{/* CTA Section */}
				{!user && (
					<Card className="text-center p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
						<h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
						<p className="text-xl mb-6 opacity-90">
							Sign up today and get access to our premium content
						</p>
						<Link to="/auth">
							<Button
								size="lg"
								className="bg-white text-blue-600 hover:bg-white/90"
							>
								Get Started Free
							</Button>
						</Link>
					</Card>
				)}
			</div>
		</div>
	);
};
