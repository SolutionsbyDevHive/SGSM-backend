import { Resend } from "resend";

const resend = new Resend("re_TCfq8vpK_GvCwV7VvkrX5RZPJ84Wt4isQ");

(async function () {
  const { data, error } = await resend.emails.send({
    from: "Saurashtra Gurjar Sutar Mandal <delivered@resend.dev>",
    to: ["solutionsbydevhive@gmail.com"],
    subject: "Thank You For Donating",
    html: "<strong>It works!</strong>",
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
})();
