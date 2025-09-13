import {
  Breadcrumbs,
  DescriptionList,
  Header,
  Panel,
} from "../../components/ui";
import { GET_USER_DETAIL } from "../../graphql/queries/users";
import { getDictionary } from "../../dictionaries";
import { useParams } from "react-router";
import { useQuery } from "@apollo/client/react";
import NotFound from "../not-found";

export default function UserDetailPage() {
  const { id } = useParams();

  const dict = getDictionary();

  const { data, error, loading } = useQuery(GET_USER_DETAIL, {
    fetchPolicy: "cache-and-network",
    variables: { id: id! },
  });
  const { user } = data ?? {};

  if ((error || !user) && !loading) {
    return <NotFound />;
  }

  return (
    <div className="p-4">
      <Breadcrumbs
        className="mb-2"
        items={[
          { href: "/users", label: dict.users.title },
          { label: user?.email },
        ]}
      />

      <Header back className="mb-3" title={user?.email} />

      <Panel>
        <DescriptionList
          items={[
            { term: dict.user.email, desc: user?.email },
            {
              term: dict.user.role,
              desc: user?.role ? dict.userRole[user.role] : undefined,
            },
          ]}
          loading={loading && !user}
        />
      </Panel>
    </div>
  );
}
