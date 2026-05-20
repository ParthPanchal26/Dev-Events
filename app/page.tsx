import EventCard from '@/components/EventCard'
import ExploreBtn from '@/components/ExploreBtn'
import { events } from '@/lib/constants'


// const events = [
// 	{
// 		image: '/images/event1.png',
// 		title: 'Event 1',
// 		slug: 'event-1',
// 		location: 'location-1',
// 		date: 'date-1',
// 		time: 'time-1',
// 	},
// ]

const Home = () => {
	return (
		<section>
			<h1 className='text-center'>The Hub for Every Dev <br /> Event You Can&apos;t  Miss.</h1>
			<p className='text-center mt-5'>Hackathons, Meetups, and conferences, all in One Place</p>

			<ExploreBtn />

			<div className="mt-20 space-y-7">
				<h3>Featured Events</h3>

				<ul className='events'>
					{events.map((event) => (
						<EventCard key={event.title} {...event} />
					))}
				</ul>
			</div>

		</section>
	)
}

export default Home