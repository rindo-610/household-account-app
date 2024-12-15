import Navbar from '../components/Navbar';
import Chart from '../components/Chart';

export default function Analysis() {
  return (
    <div>
      <Navbar />
      <div className="p-6">
        <div className="mt-6">
          <Chart />
        </div>
      </div>
    </div>
  );
}
