import { WorldAct } from "@/components/world/WorldAct";
import { BallFlight } from "@/features/home/BallFlight";
import {
  ClubInMotion,
  DayContinues,
  Invitation,
  MakeYourMove,
  StayLonger,
  TheEighteen,
  TheLand,
  ThePeople,
} from "@/features/home/Chapters";
import { readHoles } from "@/features/home/data";
import { HomeMotion } from "@/features/home/HomeMotion";

/**
 * The homepage, built to the owner's design blueprint ("Beyond the 18th"): eight chapters of
 * one day at the club, threaded by the fairway line. The course read starts here and is not
 * awaited, so nothing above it waits for the database.
 *
 * The first three chapters claim the world for the ball's drive: off the tee in the hero, into
 * the land photograph, and on to the course (BallFlight). The canvas sits over the page there.
 */
export default function Home() {
  const holes = readHoles();
  return (
    <HomeMotion>
      <WorldAct id="flight" layer="over">
        <Invitation holes={holes} />
        <TheLand />
        <TheEighteen holes={holes} />
      </WorldAct>
      <BallFlight />
      <ClubInMotion />
      <ThePeople />
      <StayLonger />
      <MakeYourMove />
      <DayContinues />
    </HomeMotion>
  );
}
