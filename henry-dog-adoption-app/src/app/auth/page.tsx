import LoginForm from "@/components/auth/LoginForm";
import classes from "../../components/auth/style/LoginForm.module.css";
import Container from "@/components/ui/Container";
import SplitText from "@/components/ui/SplitText";

export default function Page() {
  return (
    <Container>
      <div className={classes.form_container}>
        <div className={classes.login_container}>
          <h1>
            <SplitText
              copy="WELCOME TO FETCH ADOPTION CENTER!"
              role="heading"
            />
          </h1>
          <LoginForm />
        </div>
      </div>
    </Container>
  );
}
